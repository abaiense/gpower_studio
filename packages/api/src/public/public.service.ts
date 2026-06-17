import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ArtFileStatus } from '@gpower/db';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

const BUCKET = process.env['AWS_S3_BUCKET'] ?? 'gpower-studio';
const JWT_SECRET = process.env['JWT_SECRET'] ?? 'dev-secret';

interface ArtApprovalPayload {
  artFileId: string;
  projectId: string;
  studioId: string;
}

interface ConsentPayload {
  consentFormId: string;
  studioId: string;
}

@Injectable()
export class PublicService {
  private s3 = new S3Client({ region: process.env['AWS_REGION'] ?? 'us-east-1' });

  constructor(private prisma: PrismaService) {}

  private verifyArtToken(token: string): ArtApprovalPayload {
    try {
      return jwt.verify(token, JWT_SECRET, { audience: 'art-approval' }) as ArtApprovalPayload;
    } catch {
      throw new BadRequestException('Invalid or expired approval link');
    }
  }

  private verifyConsentToken(token: string): ConsentPayload {
    try {
      return jwt.verify(token, JWT_SECRET, { audience: 'consent-sign' }) as ConsentPayload;
    } catch {
      throw new BadRequestException('Invalid or expired consent link');
    }
  }

  async getArtForApproval(token: string) {
    const payload = this.verifyArtToken(token);
    const file = await this.prisma.artFile.findFirst({
      where: { id: payload.artFileId, approvalToken: token },
      include: { project: { select: { name: true } } },
    });
    if (!file) throw new NotFoundException('Art file not found');
    const viewUrl = await getSignedUrl(
      this.s3,
      new GetObjectCommand({ Bucket: BUCKET, Key: file.s3Key }),
      { expiresIn: 3600 },
    );
    const { approvalToken: _, ...fileWithoutToken } = file;
    return { artFile: fileWithoutToken, viewUrl };
  }

  async approveArt(token: string, ip: string) {
    const payload = this.verifyArtToken(token);
    const file = await this.prisma.artFile.findFirst({
      where: { id: payload.artFileId, approvalToken: token },
    });
    if (!file) throw new NotFoundException('Art file not found');
    if (file.status === ArtFileStatus.APPROVED) {
      return { message: 'Arte já aprovada' };
    }
    await this.prisma.artFile.update({
      where: { id: file.id },
      data: { status: ArtFileStatus.APPROVED, approvedAt: new Date(), approvedIp: ip },
    });
    return { message: 'Arte aprovada com sucesso!' };
  }

  async requestRevision(token: string, clientNotes: string) {
    const payload = this.verifyArtToken(token);
    const file = await this.prisma.artFile.findFirst({
      where: { id: payload.artFileId, approvalToken: token },
    });
    if (!file) throw new NotFoundException('Art file not found');
    await this.prisma.artFile.update({
      where: { id: payload.artFileId },
      data: { status: ArtFileStatus.REVISION_REQUESTED, clientNotes },
    });
    return { message: 'Solicitação de revisão enviada!' };
  }

  async getConsentForm(token: string) {
    const payload = this.verifyConsentToken(token);
    const form = await this.prisma.consentForm.findFirst({
      where: { id: payload.consentFormId, consentToken: token },
      include: { client: { select: { firstName: true, lastName: true } } },
    });
    if (!form) throw new NotFoundException('Consent form not found');
    return form;
  }

  async signConsent(token: string, ip: string, userAgent: string) {
    const payload = this.verifyConsentToken(token);
    const form = await this.prisma.consentForm.findFirst({
      where: { id: payload.consentFormId, consentToken: token },
    });
    if (!form) throw new NotFoundException('Consent form not found');
    if (form.signedAt) {
      return { message: 'Consentimento já assinado' };
    }
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(form.data) + token)
      .digest('hex');
    await this.prisma.consentForm.update({
      where: { id: payload.consentFormId },
      data: { signedAt: new Date(), signerIp: ip, signerDevice: userAgent, signatureUrl: hash },
    });
    return { message: 'Consentimento registrado com sucesso!', hash };
  }

  async getFlashSlot(token: string) {
    const slot = await this.prisma.flashSlot.findFirst({
      where: { claimToken: token },
      include: {
        artist: { select: { firstName: true, lastName: true } },
        service: { select: { name: true } },
      },
    });
    if (!slot) throw new NotFoundException('Flash slot not found');

    if (slot.status === 'OPEN' && new Date() > new Date(slot.claimDeadline)) {
      const updated = await this.prisma.flashSlot.update({
        where: { id: slot.id },
        data: { status: 'EXPIRED' },
      });
      return { ...slot, status: updated.status };
    }

    return slot;
  }

  async claimFlashSlot(token: string, phone: string) {
    const slot = await this.prisma.flashSlot.findFirst({
      where: { claimToken: token },
    });
    if (!slot) throw new NotFoundException('Flash slot not found');
    if (slot.status !== 'OPEN') {
      throw new BadRequestException(
        slot.status === 'CLAIMED'
          ? 'Este slot já foi reservado.'
          : 'Este slot não está mais disponível.',
      );
    }
    if (new Date() > new Date(slot.claimDeadline)) {
      await this.prisma.flashSlot.update({
        where: { id: slot.id },
        data: { status: 'EXPIRED' },
      });
      throw new BadRequestException('O prazo para reservar este slot expirou.');
    }

    const client = await this.prisma.client.findFirst({
      where: { phone, studioId: slot.studioId },
    });
    if (!client) {
      throw new NotFoundException(
        'Telefone não encontrado. Verifique o número ou entre em contato com o estúdio.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.flashSlot.updateMany({
        where: { id: slot.id, status: 'OPEN' },
        data: {
          status: 'CLAIMED',
          claimedByClientId: client.id,
          claimedAt: new Date(),
        },
      });
      if (updated.count === 0) {
        throw new BadRequestException(
          'Este slot acabou de ser reservado por outro cliente.',
        );
      }

      const sessionAt = new Date(slot.sessionAt);
      const endAt = new Date(sessionAt.getTime() + 2 * 60 * 60 * 1000);

      const appointment = await tx.appointment.create({
        data: {
          startAt: sessionAt,
          endAt,
          status: 'PENDING',
          totalPrice: slot.discountPrice,
          clientId: client.id,
          artistId: slot.artistId,
          serviceId: slot.serviceId,
          studioId: slot.studioId,
        },
      });

      await tx.flashSlot.update({
        where: { id: slot.id },
        data: { appointmentId: appointment.id },
      });

      return {
        message:
          'Slot reservado com sucesso! O estúdio entrará em contato para confirmar.',
        appointmentId: appointment.id,
      };
    });
  }
}

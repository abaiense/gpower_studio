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
      return { message: 'Already approved' };
    }
    await this.prisma.artFile.update({
      where: { id: payload.artFileId },
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
      return { message: 'Already signed' };
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
}

import { Injectable, NotFoundException, BadRequestException, Optional } from '@nestjs/common';
import { ArtFileStatus } from '@gpower/db';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { InitUploadDto, SendForApprovalDto } from './dto/art-file.dto';

const BUCKET = process.env['AWS_S3_BUCKET'] ?? 'gpower-studio';
const JWT_SECRET = process.env['JWT_SECRET'] ?? 'dev-secret';
const PUBLIC_URL = process.env['PUBLIC_URL'] ?? 'http://localhost:3000';

@Injectable()
export class ArtFilesService {
  private s3 = new S3Client({
    region: process.env['AWS_REGION'] ?? 'us-east-1',
    ...(process.env['AWS_ACCESS_KEY_ID']
      ? {
          credentials: {
            accessKeyId: process.env['AWS_ACCESS_KEY_ID']!,
            secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'] ?? '',
          },
        }
      : {}),
  });

  constructor(
    private prisma: PrismaService,
    @Optional() private notifications?: NotificationsService,
  ) {}

  async initUpload(projectId: string, dto: InitUploadDto, studioId: string, userId: string) {
    const project = await this.prisma.project.findFirst({ where: { id: projectId, studioId } });
    if (!project) throw new NotFoundException(`Project ${projectId} not found`);

    const lastVersion = await this.prisma.artFile.aggregate({
      where: { projectId, studioId },
      _max: { version: true },
    });
    const version = (lastVersion._max.version ?? 0) + 1;
    const s3Key = `studios/${studioId}/art/${projectId}/v${version}-${Date.now()}-${dto.filename}`;

    const artFile = await this.prisma.artFile.create({
      data: {
        version,
        filename: dto.filename,
        s3Key,
        mimeType: dto.mimeType,
        sizeBytes: dto.sizeBytes,
        notes: dto.notes ?? null,
        projectId,
        studioId,
        uploadedBy: userId,
      },
    });

    const uploadUrl = await getSignedUrl(
      this.s3,
      new PutObjectCommand({ Bucket: BUCKET, Key: s3Key, ContentType: dto.mimeType }),
      { expiresIn: 300 },
    );

    return { artFileId: artFile.id, uploadUrl, s3Key };
  }

  async confirmUpload(projectId: string, artFileId: string, studioId: string) {
    const file = await this.prisma.artFile.findFirst({
      where: { id: artFileId, projectId, studioId },
    });
    if (!file) throw new NotFoundException(`ArtFile ${artFileId} not found`);
    if (file.status !== ArtFileStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT files can be confirmed');
    }
    // S3 upload acknowledged — file stays DRAFT until sendForApproval
    return file;
  }

  async findAll(projectId: string, studioId: string) {
    return this.prisma.artFile.findMany({
      where: { projectId, studioId },
      orderBy: { version: 'asc' },
    });
  }

  async getDownloadUrl(projectId: string, artFileId: string, studioId: string) {
    const file = await this.prisma.artFile.findFirst({
      where: { id: artFileId, projectId, studioId },
    });
    if (!file) throw new NotFoundException(`ArtFile ${artFileId} not found`);
    const url = await getSignedUrl(
      this.s3,
      new GetObjectCommand({ Bucket: BUCKET, Key: file.s3Key }),
      { expiresIn: 3600 },
    );
    return { url };
  }

  async sendForApproval(projectId: string, artFileId: string, dto: SendForApprovalDto, studioId: string) {
    const file = await this.prisma.artFile.findFirst({
      where: { id: artFileId, projectId, studioId },
    });
    if (!file) throw new NotFoundException(`ArtFile ${artFileId} not found`);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const token = jwt.sign(
      { artFileId, projectId, studioId },
      JWT_SECRET,
      { expiresIn: '7d', audience: 'art-approval' },
    );

    const approvalUrl = `${PUBLIC_URL}/approve/${token}`;

    await this.prisma.artFile.update({
      where: { id: artFileId },
      data: {
        status: ArtFileStatus.SENT,
        approvalToken: token,
        approvalTokenExpiresAt: expiresAt,
        ...(dto.notes ? { notes: dto.notes } : {}),
      },
    });

    const project = await this.prisma.project.findFirst({
      where: { id: projectId },
      include: { client: true, artist: true, studio: true },
    });

    if (project && this.notifications) {
      await this.notifications.send({
        channel: 'whatsapp',
        template: 'ART_APPROVAL_REQUEST',
        recipient: {
          phone: project.client.phone ?? '',
          name: `${project.client.firstName} ${project.client.lastName}`,
        },
        data: {
          clientName: project.client.firstName,
          artistName: `${project.artist.firstName} ${project.artist.lastName}`,
          projectName: project.name,
          approvalUrl,
        },
        studioId,
      });
    }

    return { token, approvalUrl };
  }
}

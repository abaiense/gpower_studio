import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Client } from '@gpower/db';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto, UpdateClientDto } from './dto/create-client.dto';

@Injectable()
export class ClientsService {
  private s3 = new S3Client({
    region: process.env['AWS_REGION'] ?? 'us-east-1',
    ...(process.env['AWS_ACCESS_KEY_ID']
      ? {
          credentials: {
            accessKeyId: process.env['AWS_ACCESS_KEY_ID'],
            secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'] ?? '',
          },
        }
      : {}),
  });

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateClientDto, studioId: string): Promise<Client> {
    const { birthDate, ...data } = dto;

    return this.prisma.client.create({
      data: {
        ...data,
        ...(birthDate ? { birthDate: new Date(birthDate) } : {}),
        studioId,
      },
    });
  }

  async findAll(
    studioId: string,
    search?: string,
    isBlocked?: boolean,
  ): Promise<Client[]> {
    return this.prisma.client.findMany({
      where: {
        studioId,
        ...(isBlocked !== undefined ? { isBlocked } : {}),
        ...(search
          ? {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { firstName: 'asc' },
    });
  }

  async findById(id: string, studioId: string): Promise<Client> {
    const client = await this.prisma.client.findFirst({
      where: { id, studioId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  async findByPhone(phone: string, studioId: string): Promise<Client | null> {
    return this.prisma.client.findFirst({
      where: { phone, studioId },
    });
  }

  async update(id: string, dto: UpdateClientDto, studioId: string): Promise<Client> {
    await this.findById(id, studioId);

    const { birthDate, ...data } = dto;

    return this.prisma.client.update({
      where: { id },
      data: {
        ...data,
        ...(birthDate !== undefined
          ? { birthDate: birthDate ? new Date(birthDate) : null }
          : {}),
      },
    });
  }

  async remove(id: string, studioId: string): Promise<void> {
    await this.findById(id, studioId);

    await this.prisma.client.delete({ where: { id } });
  }

  async generatePhotoUploadUrl(
    clientId: string,
    studioId: string,
    fileName: string,
    contentType: string,
  ): Promise<{ uploadUrl: string; photoUrl: string }> {
    await this.findById(clientId, studioId);

    const sanitizedFileName = fileName
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9\-\.]/g, '')
      .substring(0, 100);

    const key = `studios/${studioId}/clients/${clientId}/photos/${Date.now()}-${sanitizedFileName}`;
    const bucket = process.env['AWS_S3_BUCKET'] ?? '';

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 300 });

    const photoUrl = process.env['AWS_CLOUDFRONT_URL']
      ? `${process.env['AWS_CLOUDFRONT_URL']}/${key}`
      : `https://${bucket}.s3.amazonaws.com/${key}`;

    return { uploadUrl, photoUrl };
  }
}

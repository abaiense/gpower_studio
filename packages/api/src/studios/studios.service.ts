import { Injectable, NotFoundException } from '@nestjs/common';
import { Studio } from '@gpower/db';
import { PrismaService } from '../prisma/prisma.service';
import { StudioSettingsDto, UpdatePaymentConfigDto } from './dto/studio-settings.dto';

@Injectable()
export class StudiosService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    slug: string;
    email?: string;
  }): Promise<Studio> {
    return this.prisma.studio.create({ data });
  }

  async findById(id: string): Promise<Studio | null> {
    return this.prisma.studio.findUnique({ where: { id } });
  }

  async findBySlug(slug: string): Promise<Studio | null> {
    return this.prisma.studio.findUnique({ where: { slug } });
  }

  async getSettings(studioId: string): Promise<Studio> {
    const studio = await this.prisma.studio.findUnique({
      where: { id: studioId },
    });

    if (!studio) {
      throw new NotFoundException('Studio not found');
    }

    return studio;
  }

  async updateSettings(studioId: string, dto: StudioSettingsDto): Promise<Studio> {
    const existing = await this.prisma.studio.findUnique({
      where: { id: studioId },
    });

    if (!existing) {
      throw new NotFoundException('Studio not found');
    }

    return this.prisma.studio.update({
      where: { id: studioId },
      data: dto,
    });
  }

  async getPaymentConfig(studioId: string) {
    const studio = await this.prisma.studio.findUnique({
      where: { id: studioId },
    });
    if (!studio) throw new NotFoundException('Studio not found');
    return {
      mpConfigured: !!studio.mpAccessToken,
      mpPublicKey: studio.mpPublicKey ?? null,
      // mpAccessToken is intentionally omitted
    };
  }

  async updatePaymentConfig(
    studioId: string,
    dto: UpdatePaymentConfigDto,
  ) {
    const studio = await this.prisma.studio.findUnique({
      where: { id: studioId },
    });
    if (!studio) throw new NotFoundException('Studio not found');
    return this.prisma.studio.update({
      where: { id: studioId },
      data: {
        ...(dto.mpAccessToken !== undefined
          ? { mpAccessToken: dto.mpAccessToken }
          : {}),
        ...(dto.mpPublicKey !== undefined
          ? { mpPublicKey: dto.mpPublicKey }
          : {}),
      },
      select: { id: true, mpPublicKey: true },
    });
  }
}

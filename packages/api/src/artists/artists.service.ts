import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Artist } from '@gpower/db';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArtistDto, UpdateArtistDto, UpsertScheduleDto } from './dto/create-artist.dto';

@Injectable()
export class ArtistsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateArtistDto, studioId: string): Promise<Artist> {
    const { schedules, ...data } = dto;

    return this.prisma.artist.create({
      data: {
        ...data,
        studioId,
        ...(schedules?.length
          ? { schedules: { create: schedules } }
          : {}),
      },
      include: { schedules: true },
    });
  }

  async findAll(studioId: string): Promise<Artist[]> {
    return this.prisma.artist.findMany({
      where: { studioId },
      include: { schedules: true, user: { select: { id: true, email: true } } },
      orderBy: { firstName: 'asc' },
    });
  }

  async findById(id: string, studioId: string): Promise<Artist> {
    const artist = await this.prisma.artist.findFirst({
      where: { id, studioId },
      include: { schedules: true, user: { select: { id: true, email: true } } },
    });

    if (!artist) {
      throw new NotFoundException('Artist not found');
    }

    return artist;
  }

  async update(id: string, dto: UpdateArtistDto, studioId: string): Promise<Artist> {
    await this.findById(id, studioId);

    return this.prisma.artist.update({
      where: { id },
      data: dto,
      include: { schedules: true },
    });
  }

  async remove(id: string, studioId: string): Promise<void> {
    await this.findById(id, studioId);

    await this.prisma.artist.delete({ where: { id } });
  }

  async getSchedules(artistId: string, studioId: string) {
    await this.findById(artistId, studioId);

    return this.prisma.artistSchedule.findMany({
      where: { artistId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async upsertSchedules(
    artistId: string,
    schedules: UpsertScheduleDto[],
    studioId: string,
  ) {
    await this.findById(artistId, studioId);

    // Delete existing schedules and recreate
    await this.prisma.artistSchedule.deleteMany({ where: { artistId } });

    if (schedules.length === 0) return [];

    return this.prisma.artistSchedule.createManyAndReturn({
      data: schedules.map((s) => ({
        artistId,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        isActive: s.isActive ?? true,
      })),
    });
  }
}

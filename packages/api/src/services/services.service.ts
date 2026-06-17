import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Service, ServiceCategory } from '@gpower/db';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/create-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateServiceDto, studioId: string): Promise<Service> {
    return this.prisma.service.create({
      data: { ...dto, studioId },
    });
  }

  async findAll(
    studioId: string,
    category?: ServiceCategory,
  ): Promise<Service[]> {
    return this.prisma.service.findMany({
      where: {
        studioId,
        ...(category ? { category } : {}),
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string, studioId: string): Promise<Service> {
    const service = await this.prisma.service.findFirst({
      where: { id, studioId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  async update(id: string, dto: UpdateServiceDto, studioId: string): Promise<Service> {
    await this.findById(id, studioId);

    return this.prisma.service.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, studioId: string): Promise<void> {
    await this.findById(id, studioId);

    await this.prisma.service.delete({ where: { id } });
  }
}

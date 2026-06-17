import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Client } from '@gpower/db';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto, UpdateClientDto } from './dto/create-client.dto';

@Injectable()
export class ClientsService {
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

  async findAll(studioId: string): Promise<Client[]> {
    return this.prisma.client.findMany({
      where: { studioId },
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
}

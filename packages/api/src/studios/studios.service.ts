import { Injectable } from '@nestjs/common';
import { Studio } from '@gpower/db';
import { PrismaService } from '../prisma/prisma.service';

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
}

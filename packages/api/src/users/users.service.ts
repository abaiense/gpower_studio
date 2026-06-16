import { Injectable } from '@nestjs/common';
import { User } from '@gpower/db';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByStudio(studioId: string): Promise<User[]> {
    return this.prisma.user.findMany({ where: { studioId, isActive: true } });
  }
}

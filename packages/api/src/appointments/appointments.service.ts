import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Appointment, Prisma } from '@gpower/db';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  QueryAppointmentDto,
} from './dto/create-appointment.dto';

const appointmentInclude = {
  client: { select: { id: true, firstName: true, lastName: true, phone: true } },
  artist: { select: { id: true, firstName: true, lastName: true } },
  service: { select: { id: true, name: true, category: true, durationMin: true } },
} satisfies Prisma.AppointmentInclude;

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAppointmentDto, studioId: string): Promise<Appointment> {
    const { startAt, endAt, ...data } = dto;

    return this.prisma.appointment.create({
      data: {
        ...data,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        studioId,
      },
      include: appointmentInclude,
    });
  }

  async findAll(
    studioId: string,
    query?: QueryAppointmentDto,
  ): Promise<Appointment[]> {
    const where: Prisma.AppointmentWhereInput = { studioId };

    if (query) {
      if (query.startDate && query.endDate) {
        where.startAt = {
          gte: new Date(query.startDate),
          lte: new Date(query.endDate),
        };
      } else if (query.startDate) {
        where.startAt = { gte: new Date(query.startDate) };
      } else if (query.endDate) {
        where.startAt = { lte: new Date(query.endDate) };
      }

      if (query.status) {
        where.status = query.status;
      }

      if (query.artistId) {
        where.artistId = query.artistId;
      }
    }

    return this.prisma.appointment.findMany({
      where,
      include: appointmentInclude,
      orderBy: { startAt: 'asc' },
    });
  }

  async findById(id: string, studioId: string): Promise<Appointment> {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id, studioId },
      include: {
        ...appointmentInclude,
        payments: true,
        project: { select: { id: true, name: true, status: true } },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async update(
    id: string,
    dto: UpdateAppointmentDto,
    studioId: string,
  ): Promise<Appointment> {
    await this.findById(id, studioId);

    const { startAt, endAt, ...data } = dto;

    return this.prisma.appointment.update({
      where: { id },
      data: {
        ...data,
        ...(startAt !== undefined ? { startAt: new Date(startAt) } : {}),
        ...(endAt !== undefined ? { endAt: new Date(endAt) } : {}),
      },
      include: appointmentInclude,
    });
  }

  async remove(id: string, studioId: string): Promise<void> {
    await this.findById(id, studioId);

    await this.prisma.appointment.delete({ where: { id } });
  }
}

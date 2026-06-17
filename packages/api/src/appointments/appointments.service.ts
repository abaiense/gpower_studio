import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Appointment, AppointmentStatus, Prisma } from '@gpower/db';
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

const NON_BLOCKING_STATUSES: AppointmentStatus[] = [
  AppointmentStatus.CANCELLED,
  AppointmentStatus.NO_SHOW,
];

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  private async checkConflict(
    artistId: string,
    startAt: Date,
    endAt: Date,
    excludeId?: string,
  ): Promise<void> {
    const conflict = await this.prisma.appointment.findFirst({
      where: {
        artistId,
        status: { notIn: NON_BLOCKING_STATUSES },
        startAt: { lt: endAt },
        endAt: { gt: startAt },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });

    if (conflict) {
      throw new ConflictException(
        'Artist already has an appointment in this time slot',
      );
    }
  }

  async create(dto: CreateAppointmentDto, studioId: string): Promise<Appointment> {
    const { startAt, endAt, ...data } = dto;

    await this.checkConflict(dto.artistId, new Date(startAt), new Date(endAt));

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
    const existing = await this.findById(id, studioId);

    const { startAt, endAt, ...data } = dto;

    if (startAt !== undefined || endAt !== undefined) {
      const finalStart = startAt !== undefined ? new Date(startAt) : existing.startAt;
      const finalEnd = endAt !== undefined ? new Date(endAt) : existing.endAt;
      const existingArtistId = dto.artistId ?? existing.artistId;

      await this.checkConflict(existingArtistId, finalStart, finalEnd, id);
    }

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

  async getAvailability(
    studioId: string,
    artistId: string,
    date: string,
  ): Promise<Array<{ startAt: string; endAt: string }>> {
    const dayDate = new Date(`${date}T00:00:00`);
    const dayOfWeek = dayDate.getDay();

    const schedule = await this.prisma.artistSchedule.findFirst({
      where: { artistId, dayOfWeek, isActive: true },
    });

    if (!schedule) {
      return [];
    }

    const dayStart = new Date(`${date}T00:00:00`);
    const dayEnd = new Date(`${date}T23:59:59`);

    const existingAppointments = await this.prisma.appointment.findMany({
      where: {
        artistId,
        status: { notIn: NON_BLOCKING_STATUSES },
        startAt: { gte: dayStart },
        endAt: { lte: dayEnd },
      },
    });

    // Parse schedule start/end times as local hours/minutes
    const startParts = schedule.startTime.split(':').map(Number);
    const endParts = schedule.endTime.split(':').map(Number);
    const startHour = startParts[0] ?? 0;
    const startMin = startParts[1] ?? 0;
    const endHour = endParts[0] ?? 0;
    const endMin = endParts[1] ?? 0;

    const scheduleStart = new Date(dayDate);
    scheduleStart.setHours(startHour, startMin, 0, 0);

    const scheduleEnd = new Date(dayDate);
    scheduleEnd.setHours(endHour, endMin, 0, 0);

    const slots: Array<{ startAt: string; endAt: string }> = [];
    const slotDuration = 60 * 60 * 1000; // 60 minutes in ms

    let cursor = scheduleStart.getTime();
    const end = scheduleEnd.getTime();

    while (cursor + slotDuration <= end) {
      const slotStart = new Date(cursor);
      const slotEnd = new Date(cursor + slotDuration);

      const hasOverlap = existingAppointments.some(
        (appt) =>
          appt.startAt < slotEnd && appt.endAt > slotStart,
      );

      if (!hasOverlap) {
        slots.push({
          startAt: slotStart.toISOString(),
          endAt: slotEnd.toISOString(),
        });
      }

      cursor += slotDuration;
    }

    return slots;
  }
}

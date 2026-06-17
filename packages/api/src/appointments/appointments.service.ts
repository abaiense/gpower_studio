import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import { Appointment, AppointmentStatus, CommissionType, Prisma } from '@gpower/db';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  QueryAppointmentDto,
  CloseSessionDto,
} from './dto/create-appointment.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { AppointmentData } from '../notifications/dto/notification.dto';

export interface CommissionResult {
  artistId: string;
  commissionType: CommissionType;
  commissionValue: number;
  totalPrice: number;
  depositAmount: number;
  depositDeducted: number;
  netRevenue: number;
  artistEarns: number;
  studioEarns: number;
}

export interface DailyCashReport {
  date: string;
  totalRevenue: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  paymentBreakdown: Record<string, number>;
  artistSummary: Array<{
    artistId: string;
    artistName: string;
    sessions: number;
    revenue: number;
    artistEarns: number;
    studioEarns: number;
  }>;
}

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
  constructor(
    private prisma: PrismaService,
    @Optional() private notificationsService?: NotificationsService,
  ) {}

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

    const appointment = await this.prisma.appointment.create({
      data: {
        ...data,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        studioId,
      },
      include: {
        ...appointmentInclude,
        client: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
        artist: { select: { id: true, firstName: true, lastName: true } },
        service: { select: { id: true, name: true, category: true, durationMin: true } },
        studio: { select: { id: true, name: true } },
      },
    });

    if (this.notificationsService) {
      const clientEmail = appointment.client.email;
      const apptData: AppointmentData = {
        appointmentId: appointment.id,
        clientName: `${appointment.client.firstName} ${appointment.client.lastName}`,
        clientPhone: appointment.client.phone,
        ...(clientEmail ? { clientEmail } : {}),
        artistName: `${appointment.artist.firstName} ${appointment.artist.lastName}`,
        serviceName: appointment.service.name,
        startAt: appointment.startAt.toISOString(),
        studioId: appointment.studioId,
        studioName: appointment.studio.name,
      };
      void this.notificationsService.sendAppointmentConfirmation(apptData).catch(() => {
        // silently ignore notification errors
      });
    }

    return appointment;
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

  async closeSession(
    id: string,
    dto: CloseSessionDto,
    studioId: string,
  ): Promise<{ appointment: Appointment; commission: CommissionResult }> {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id, studioId },
      include: {
        client: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
        artist: { select: { id: true, firstName: true, lastName: true, commissionType: true, commissionValue: true } },
        service: { select: { id: true, name: true, category: true, durationMin: true } },
        studio: { select: { id: true, name: true } },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException('Appointment is already completed');
    }

    const artist = await this.prisma.artist.findFirst({
      where: { id: appointment.artistId },
    });

    if (!artist) {
      throw new NotFoundException('Artist not found');
    }

    const depositAmount = appointment.depositAmount ?? 0;
    const depositDeducted = Math.min(depositAmount, dto.totalPrice);
    const netRevenue = dto.totalPrice - depositDeducted;

    let artistEarns: number;
    if (artist.commissionType === CommissionType.PERCENTAGE) {
      artistEarns = Math.round(netRevenue * (artist.commissionValue / 100) * 100) / 100;
    } else {
      artistEarns = Math.round(artist.commissionValue * 100) / 100;
    }

    const studioEarns = Math.round((netRevenue - artistEarns) * 100) / 100;

    const paidAt = new Date();

    const [updatedAppointment] = await this.prisma.$transaction([
      this.prisma.appointment.update({
        where: { id },
        data: {
          status: AppointmentStatus.COMPLETED,
          totalPrice: dto.totalPrice,
          ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        },
        include: appointmentInclude,
      }),
      ...dto.payments.map((p) =>
        this.prisma.payment.create({
          data: {
            appointmentId: id,
            method: p.method,
            amount: p.amount,
            status: 'PAID',
            paidAt,
          },
        }),
      ),
    ]);

    const commission: CommissionResult = {
      artistId: artist.id,
      commissionType: artist.commissionType,
      commissionValue: artist.commissionValue,
      totalPrice: dto.totalPrice,
      depositAmount,
      depositDeducted,
      netRevenue,
      artistEarns,
      studioEarns,
    };

    if (this.notificationsService && appointment.client && appointment.service && appointment.studio) {
      const clientEmail = appointment.client.email;
      const apptData: AppointmentData = {
        appointmentId: appointment.id,
        clientName: `${appointment.client.firstName} ${appointment.client.lastName}`,
        clientPhone: appointment.client.phone,
        ...(clientEmail ? { clientEmail } : {}),
        artistName: `${artist.firstName} ${artist.lastName}`,
        serviceName: appointment.service.name,
        startAt: appointment.startAt.toISOString(),
        studioId: appointment.studioId,
        studioName: appointment.studio.name,
      };
      void this.notificationsService.sendAftercare(apptData).catch(() => {
        // silently ignore notification errors
      });
    }

    return { appointment: updatedAppointment as Appointment, commission };
  }

  async getDailyCashReport(
    studioId: string,
    date: string,
  ): Promise<DailyCashReport> {
    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        studioId,
        status: AppointmentStatus.COMPLETED,
        startAt: { gte: dayStart, lte: dayEnd },
      },
      include: {
        payments: true,
        artist: { select: { id: true, firstName: true, lastName: true, commissionType: true, commissionValue: true } },
      },
    });

    const allAppointmentsForDay = await this.prisma.appointment.findMany({
      where: {
        studioId,
        startAt: { gte: dayStart, lte: dayEnd },
      },
      select: { status: true },
    });

    const totalAppointments = allAppointmentsForDay.length;
    const cancelledAppointments = allAppointmentsForDay.filter(
      (a) => a.status === AppointmentStatus.CANCELLED,
    ).length;
    const completedAppointments = appointments.length;

    let totalRevenue = 0;
    const paymentBreakdown: Record<string, number> = {};
    const artistMap = new Map<string, {
      artistId: string;
      artistName: string;
      sessions: number;
      revenue: number;
      artistEarns: number;
      studioEarns: number;
    }>();

    for (const appt of appointments) {
      const apptTotal = appt.totalPrice ?? 0;
      totalRevenue += apptTotal;

      for (const payment of appt.payments) {
        const method = payment.method as string;
        paymentBreakdown[method] = (paymentBreakdown[method] ?? 0) + payment.amount;
      }

      if (appt.artist) {
        const depositAmount = appt.depositAmount ?? 0;
        const depositDeducted = Math.min(depositAmount, apptTotal);
        const netRevenue = apptTotal - depositDeducted;

        let artistEarns: number;
        if (appt.artist.commissionType === CommissionType.PERCENTAGE) {
          artistEarns = Math.round(netRevenue * (appt.artist.commissionValue / 100) * 100) / 100;
        } else {
          artistEarns = Math.round(appt.artist.commissionValue * 100) / 100;
        }
        const studioEarns = Math.round((netRevenue - artistEarns) * 100) / 100;

        const existing = artistMap.get(appt.artist.id);
        if (existing) {
          existing.sessions += 1;
          existing.revenue += apptTotal;
          existing.artistEarns += artistEarns;
          existing.studioEarns += studioEarns;
        } else {
          artistMap.set(appt.artist.id, {
            artistId: appt.artist.id,
            artistName: `${appt.artist.firstName} ${appt.artist.lastName}`,
            sessions: 1,
            revenue: apptTotal,
            artistEarns,
            studioEarns,
          });
        }
      }
    }

    return {
      date,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
      paymentBreakdown,
      artistSummary: Array.from(artistMap.values()),
    };
  }
}

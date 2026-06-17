import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Payment, PaymentStatus } from '@gpower/db';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePaymentDto, studioId: string): Promise<Payment> {
    // Verify the appointment belongs to this studio
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: dto.appointmentId, studioId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return this.prisma.payment.create({
      data: {
        amount: dto.amount,
        method: dto.method,
        appointmentId: dto.appointmentId,
        externalId: dto.externalId,
        gateway: dto.gateway,
      },
    });
  }

  async findByAppointment(
    appointmentId: string,
    studioId: string,
  ): Promise<Payment[]> {
    // Verify the appointment belongs to this studio
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, studioId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return this.prisma.payment.findMany({
      where: { appointmentId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async markPaid(id: string, studioId: string): Promise<Payment> {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id,
        appointment: { studioId },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return this.prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.PAID,
        paidAt: new Date(),
      },
    });
  }

  async refund(id: string, studioId: string): Promise<Payment> {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id,
        appointment: { studioId },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.PAID) {
      throw new BadRequestException('Only PAID payments can be refunded');
    }

    return this.prisma.payment.update({
      where: { id },
      data: { status: PaymentStatus.REFUNDED },
    });
  }
}

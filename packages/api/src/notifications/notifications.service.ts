import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import {
  AppointmentData,
  NotificationJobDto,
} from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectQueue('notifications') private readonly notificationsQueue: Queue<NotificationJobDto>,
  ) {}

  async send(job: NotificationJobDto): Promise<void> {
    await this.notificationsQueue.add(job);
  }

  async sendAppointmentConfirmation(appointment: AppointmentData): Promise<void> {
    const data: Record<string, string> = {
      clientName: appointment.clientName,
      artistName: appointment.artistName,
      serviceName: appointment.serviceName,
      startAt: appointment.startAt,
      studioName: appointment.studioName,
    };

    const sharedJob = {
      template: 'APPOINTMENT_CONFIRMATION' as const,
      data,
      studioId: appointment.studioId,
      appointmentId: appointment.appointmentId,
    };

    await this.send({
      ...sharedJob,
      channel: 'whatsapp',
      recipient: { phone: appointment.clientPhone, name: appointment.clientName },
    });

    if (appointment.clientEmail) {
      await this.send({
        ...sharedJob,
        channel: 'email',
        recipient: { email: appointment.clientEmail, name: appointment.clientName },
      });
    }
  }

  async sendAppointmentReminder(
    appointment: AppointmentData,
    hoursUntil: number,
  ): Promise<void> {
    const data: Record<string, string> = {
      clientName: appointment.clientName,
      artistName: appointment.artistName,
      serviceName: appointment.serviceName,
      startAt: appointment.startAt,
      studioName: appointment.studioName,
      hoursUntil: String(hoursUntil),
    };

    const sharedJob = {
      template: 'APPOINTMENT_REMINDER' as const,
      data,
      studioId: appointment.studioId,
      appointmentId: appointment.appointmentId,
    };

    await this.send({
      ...sharedJob,
      channel: 'whatsapp',
      recipient: { phone: appointment.clientPhone, name: appointment.clientName },
    });

    if (appointment.clientEmail) {
      await this.send({
        ...sharedJob,
        channel: 'email',
        recipient: { email: appointment.clientEmail, name: appointment.clientName },
      });
    }
  }

  async sendDepositRequest(
    appointment: AppointmentData,
    depositAmount: number,
    paymentLink: string,
  ): Promise<void> {
    const data: Record<string, string> = {
      clientName: appointment.clientName,
      artistName: appointment.artistName,
      serviceName: appointment.serviceName,
      startAt: appointment.startAt,
      studioName: appointment.studioName,
      depositAmount: String(depositAmount),
      paymentLink,
    };

    const sharedJob = {
      template: 'DEPOSIT_REQUEST' as const,
      data,
      studioId: appointment.studioId,
      appointmentId: appointment.appointmentId,
    };

    await this.send({
      ...sharedJob,
      channel: 'whatsapp',
      recipient: { phone: appointment.clientPhone, name: appointment.clientName },
    });

    if (appointment.clientEmail) {
      await this.send({
        ...sharedJob,
        channel: 'email',
        recipient: { email: appointment.clientEmail, name: appointment.clientName },
      });
    }
  }

  async sendAftercare(appointment: AppointmentData): Promise<void> {
    const data: Record<string, string> = {
      clientName: appointment.clientName,
      artistName: appointment.artistName,
      serviceName: appointment.serviceName,
      startAt: appointment.startAt,
      studioName: appointment.studioName,
    };

    const sharedJob = {
      template: 'AFTERCARE_DAY1' as const,
      data,
      studioId: appointment.studioId,
      appointmentId: appointment.appointmentId,
    };

    await this.send({
      ...sharedJob,
      channel: 'whatsapp',
      recipient: { phone: appointment.clientPhone, name: appointment.clientName },
    });

    if (appointment.clientEmail) {
      await this.send({
        ...sharedJob,
        channel: 'email',
        recipient: { email: appointment.clientEmail, name: appointment.clientName },
      });
    }
  }
}

export type NotificationChannel = 'whatsapp' | 'email';

export type NotificationTemplate =
  | 'APPOINTMENT_CONFIRMATION'
  | 'APPOINTMENT_REMINDER'
  | 'DEPOSIT_REQUEST'
  | 'AFTERCARE_DAY1';

export interface AppointmentData {
  appointmentId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  artistName: string;
  serviceName: string;
  startAt: string; // ISO
  studioId: string;
  studioName: string;
}

export interface NotificationJobDto {
  channel: NotificationChannel;
  template: NotificationTemplate;
  recipient: { phone?: string; email?: string; name: string };
  data: Record<string, string>;
  studioId: string;
  appointmentId?: string;
}

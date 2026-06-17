import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';
import { NotificationsService } from './notifications.service';
import { AppointmentData } from './dto/notification.dto';

const mockQueue = {
  add: jest.fn(),
};

const mockAppointment: AppointmentData = {
  appointmentId: 'appt-1',
  clientName: 'João Silva',
  clientPhone: '+5511999999999',
  clientEmail: 'joao@example.com',
  artistName: 'Maria Arte',
  serviceName: 'Tatuagem Blackwork',
  startAt: '2026-06-20T10:00:00.000Z',
  studioId: 'studio-1',
  studioName: 'GPower Studio',
};

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    mockQueue.add.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getQueueToken('notifications'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  // ── sendAppointmentConfirmation ───────────────────────────────────────────

  describe('sendAppointmentConfirmation', () => {
    it('enqueues a whatsapp job with APPOINTMENT_CONFIRMATION template', async () => {
      await service.sendAppointmentConfirmation(mockAppointment);

      const whatsappCall = mockQueue.add.mock.calls.find(
        (call: unknown[]) => {
          const job = call[0] as { channel: string };
          return job.channel === 'whatsapp';
        },
      );
      expect(whatsappCall).toBeDefined();
      const job = whatsappCall![0] as { template: string; studioId: string; data: Record<string, string> };
      expect(job.template).toBe('APPOINTMENT_CONFIRMATION');
      expect(job.studioId).toBe('studio-1');
      expect(job.data.clientName).toBe('João Silva');
    });

    it('enqueues an email job when clientEmail is present', async () => {
      await service.sendAppointmentConfirmation(mockAppointment);

      const emailCall = mockQueue.add.mock.calls.find(
        (call: unknown[]) => {
          const job = call[0] as { channel: string };
          return job.channel === 'email';
        },
      );
      expect(emailCall).toBeDefined();
      const job = emailCall![0] as { template: string; recipient: { email: string } };
      expect(job.template).toBe('APPOINTMENT_CONFIRMATION');
      expect(job.recipient.email).toBe('joao@example.com');
    });

    it('does not enqueue email job when clientEmail is absent', async () => {
      const { clientEmail: _removed, ...rest } = mockAppointment;
      const noEmail: AppointmentData = rest;
      await service.sendAppointmentConfirmation(noEmail);

      const emailCalls = mockQueue.add.mock.calls.filter(
        (call: unknown[]) => {
          const job = call[0] as { channel: string };
          return job.channel === 'email';
        },
      );
      expect(emailCalls).toHaveLength(0);
    });

    it('enqueues a job with correct appointmentId', async () => {
      await service.sendAppointmentConfirmation(mockAppointment);

      const whatsappCall = mockQueue.add.mock.calls.find(
        (call: unknown[]) => {
          const job = call[0] as { channel: string };
          return job.channel === 'whatsapp';
        },
      );
      expect(whatsappCall).toBeDefined();
      const job = whatsappCall![0] as { appointmentId: string };
      expect(job.appointmentId).toBe('appt-1');
    });
  });

  // ── sendDepositRequest ────────────────────────────────────────────────────

  describe('sendDepositRequest', () => {
    it('enqueues whatsapp job with DEPOSIT_REQUEST template and paymentLink in data', async () => {
      const paymentLink = 'https://pay.gpower.studio/appt-1';
      await service.sendDepositRequest(mockAppointment, 150, paymentLink);

      const whatsappCall = mockQueue.add.mock.calls.find(
        (call: unknown[]) => {
          const job = call[0] as { channel: string };
          return job.channel === 'whatsapp';
        },
      );
      expect(whatsappCall).toBeDefined();
      const job = whatsappCall![0] as {
        template: string;
        data: { paymentLink: string; depositAmount: string };
      };
      expect(job.template).toBe('DEPOSIT_REQUEST');
      expect(job.data.paymentLink).toBe(paymentLink);
      expect(job.data.depositAmount).toBe('150');
    });

    it('enqueues email job with paymentLink for clients with email', async () => {
      await service.sendDepositRequest(mockAppointment, 200, 'https://pay.example.com');

      const emailCall = mockQueue.add.mock.calls.find(
        (call: unknown[]) => {
          const job = call[0] as { channel: string };
          return job.channel === 'email';
        },
      );
      expect(emailCall).toBeDefined();
      const job = emailCall![0] as { data: { paymentLink: string } };
      expect(job.data.paymentLink).toBe('https://pay.example.com');
    });
  });

  // ── sendAftercare ─────────────────────────────────────────────────────────

  describe('sendAftercare', () => {
    it('enqueues an AFTERCARE_DAY1 whatsapp job', async () => {
      await service.sendAftercare(mockAppointment);

      const whatsappCall = mockQueue.add.mock.calls.find(
        (call: unknown[]) => {
          const job = call[0] as { channel: string };
          return job.channel === 'whatsapp';
        },
      );
      expect(whatsappCall).toBeDefined();
      const job = whatsappCall![0] as { template: string };
      expect(job.template).toBe('AFTERCARE_DAY1');
    });

    it('enqueues an AFTERCARE_DAY1 email job for clients with email', async () => {
      await service.sendAftercare(mockAppointment);

      const emailCall = mockQueue.add.mock.calls.find(
        (call: unknown[]) => {
          const job = call[0] as { channel: string };
          return job.channel === 'email';
        },
      );
      expect(emailCall).toBeDefined();
      const job = emailCall![0] as { template: string };
      expect(job.template).toBe('AFTERCARE_DAY1');
    });

    it('includes studioName in aftercare data', async () => {
      await service.sendAftercare(mockAppointment);

      const whatsappCall = mockQueue.add.mock.calls.find(
        (call: unknown[]) => {
          const job = call[0] as { channel: string };
          return job.channel === 'whatsapp';
        },
      );
      const job = whatsappCall![0] as { data: { studioName: string } };
      expect(job.data.studioName).toBe('GPower Studio');
    });
  });

  // ── sendAppointmentReminder ───────────────────────────────────────────────

  describe('sendAppointmentReminder', () => {
    it('enqueues APPOINTMENT_REMINDER job with hoursUntil in data', async () => {
      await service.sendAppointmentReminder(mockAppointment, 24);

      const whatsappCall = mockQueue.add.mock.calls.find(
        (call: unknown[]) => {
          const job = call[0] as { channel: string };
          return job.channel === 'whatsapp';
        },
      );
      expect(whatsappCall).toBeDefined();
      const job = whatsappCall![0] as { template: string; data: { hoursUntil: string } };
      expect(job.template).toBe('APPOINTMENT_REMINDER');
      expect(job.data.hoursUntil).toBe('24');
    });
  });
});

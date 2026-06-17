import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';

// ── Helpers ──────────────────────────────────────────────────────────────────

const mockAppointment = {
  id: 'appt-1',
  studioId: 'studio-1',
  artistId: 'artist-1',
  clientId: 'client-1',
  serviceId: 'service-1',
  status: 'PENDING',
  totalPrice: null,
  depositAmount: 0,
  depositPaidAt: null,
  startAt: new Date('2026-06-20T10:00:00Z'),
  endAt: new Date('2026-06-20T12:00:00Z'),
  notes: null,
  sessionNumber: null,
  projectId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPayment = {
  id: 'pay-1',
  amount: 500,
  method: 'PIX' as const,
  status: 'PENDING' as const,
  externalId: null,
  gateway: null,
  paidAt: null,
  appointmentId: 'appt-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const createPrismaMock = () => ({
  appointment: {
    findFirst: jest.fn(),
  },
  payment: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
});

// ── Test suite ────────────────────────────────────────────────────────────────

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  // ── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('creates a payment for a valid appointment', async () => {
      const dto = { appointmentId: 'appt-1', amount: 500, method: 'PIX' as const };
      prisma.appointment.findFirst.mockResolvedValue(mockAppointment);
      prisma.payment.create.mockResolvedValue(mockPayment);

      const result = await service.create(dto, 'studio-1');

      expect(result).toEqual(mockPayment);
      expect(prisma.appointment.findFirst).toHaveBeenCalledWith({
        where: { id: 'appt-1', studioId: 'studio-1' },
      });
      expect(prisma.payment.create).toHaveBeenCalledWith({
        data: {
          amount: 500,
          method: 'PIX',
          appointmentId: 'appt-1',
          externalId: undefined,
          gateway: undefined,
        },
      });
    });

    it('throws NotFoundException when appointment does not exist for the studio', async () => {
      const dto = { appointmentId: 'nonexistent', amount: 500, method: 'PIX' as const };
      prisma.appointment.findFirst.mockResolvedValue(null);

      await expect(service.create(dto, 'studio-1')).rejects.toThrow(NotFoundException);
      expect(prisma.payment.create).not.toHaveBeenCalled();
    });

    it('creates a payment with optional externalId and gateway', async () => {
      const dto = {
        appointmentId: 'appt-1',
        amount: 300,
        method: 'CREDIT_CARD' as const,
        externalId: 'ext-123',
        gateway: 'stripe',
      };
      const expectedPayment = { ...mockPayment, ...dto };
      prisma.appointment.findFirst.mockResolvedValue(mockAppointment);
      prisma.payment.create.mockResolvedValue(expectedPayment);

      const result = await service.create(dto, 'studio-1');

      expect(result.externalId).toBe('ext-123');
      expect(result.gateway).toBe('stripe');
    });
  });

  // ── findByAppointment ─────────────────────────────────────────────────────

  describe('findByAppointment', () => {
    it('returns payments for a valid appointment', async () => {
      prisma.appointment.findFirst.mockResolvedValue(mockAppointment);
      prisma.payment.findMany.mockResolvedValue([mockPayment]);

      const result = await service.findByAppointment('appt-1', 'studio-1');

      expect(result).toEqual([mockPayment]);
      expect(prisma.payment.findMany).toHaveBeenCalledWith({
        where: { appointmentId: 'appt-1' },
        orderBy: { createdAt: 'asc' },
      });
    });

    it('throws NotFoundException when appointment does not belong to studio', async () => {
      prisma.appointment.findFirst.mockResolvedValue(null);

      await expect(
        service.findByAppointment('appt-1', 'other-studio'),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.payment.findMany).not.toHaveBeenCalled();
    });
  });

  // ── markPaid ──────────────────────────────────────────────────────────────

  describe('markPaid', () => {
    it('sets status to PAID and sets paidAt', async () => {
      prisma.payment.findFirst.mockResolvedValue(mockPayment);
      const paidPayment = { ...mockPayment, status: 'PAID', paidAt: new Date() };
      prisma.payment.update.mockResolvedValue(paidPayment);

      const result = await service.markPaid('pay-1', 'studio-1');

      expect(result.status).toBe('PAID');
      expect(result.paidAt).toBeDefined();
      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { id: 'pay-1' },
        data: expect.objectContaining({
          status: 'PAID',
          paidAt: expect.any(Date),
        }),
      });
    });

    it('throws NotFoundException when payment does not exist', async () => {
      prisma.payment.findFirst.mockResolvedValue(null);

      await expect(service.markPaid('nonexistent', 'studio-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.payment.update).not.toHaveBeenCalled();
    });
  });

  // ── refund ────────────────────────────────────────────────────────────────

  describe('refund', () => {
    it('sets status to REFUNDED for a PAID payment', async () => {
      const paidPayment = { ...mockPayment, status: 'PAID' as const };
      prisma.payment.findFirst.mockResolvedValue(paidPayment);
      const refundedPayment = { ...paidPayment, status: 'REFUNDED' };
      prisma.payment.update.mockResolvedValue(refundedPayment);

      const result = await service.refund('pay-1', 'studio-1');

      expect(result.status).toBe('REFUNDED');
      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { id: 'pay-1' },
        data: { status: 'REFUNDED' },
      });
    });

    it('throws BadRequestException when payment status is not PAID', async () => {
      const pendingPayment = { ...mockPayment, status: 'PENDING' as const };
      prisma.payment.findFirst.mockResolvedValue(pendingPayment);

      await expect(service.refund('pay-1', 'studio-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.payment.update).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when payment status is REFUNDED', async () => {
      const refundedPayment = { ...mockPayment, status: 'REFUNDED' as const };
      prisma.payment.findFirst.mockResolvedValue(refundedPayment);

      await expect(service.refund('pay-1', 'studio-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws NotFoundException when payment does not exist', async () => {
      prisma.payment.findFirst.mockResolvedValue(null);

      await expect(service.refund('nonexistent', 'studio-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

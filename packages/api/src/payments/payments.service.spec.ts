import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

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
  studio: {
    findUnique: jest.fn(),
  },
});

// ── Test suite ────────────────────────────────────────────────────────────────

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();
    jest.clearAllMocks();

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

  // ── createManual ──────────────────────────────────────────────────────────

  describe('createManual', () => {
    it('creates PAID payment with source infinitepay', async () => {
      prisma.appointment.findFirst.mockResolvedValue({ id: 'apt-1', studioId: 'studio-1' });
      prisma.payment.create.mockResolvedValue({
        id: 'pay-1',
        amount: 500,
        method: 'CREDIT_CARD',
        status: 'PAID',
        source: 'infinitepay',
        installments: 3,
        installmentValue: 166.67,
        checkoutUrl: null,
        externalId: null,
        gateway: null,
        paidAt: new Date(),
        appointmentId: 'apt-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.createManual(
        { appointmentId: 'apt-1', amount: 500, method: 'CREDIT_CARD' as any, installments: 3 },
        'studio-1',
      );

      expect(result.status).toBe('PAID');
      expect(result.source).toBe('infinitepay');
      expect(prisma.payment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'PAID',
            source: 'infinitepay',
            installments: 3,
            paidAt: expect.any(Date),
          }),
        }),
      );
    });

    it('throws NotFoundException if appointment not in studio', async () => {
      prisma.appointment.findFirst.mockResolvedValue(null);
      await expect(
        service.createManual(
          { appointmentId: 'bad', amount: 100, method: 'PIX' as any },
          'studio-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── createCheckout ────────────────────────────────────────────────────────

  describe('createCheckout', () => {
    it('calls MP API and returns checkoutUrl', async () => {
      prisma.appointment.findFirst.mockResolvedValue({ id: 'apt-1', studioId: 'studio-1' });
      prisma.studio.findUnique.mockResolvedValue({
        id: 'studio-1',
        mpAccessToken: 'TEST_TOKEN',
        mpPublicKey: 'pk',
      });
      mockedAxios.post.mockResolvedValue({
        data: { id: 'pref-123', init_point: 'https://mp.com/checkout/pref-123' },
      });
      prisma.payment.create.mockResolvedValue({
        id: 'pay-1',
        amount: 500,
        method: 'CREDIT_CARD',
        status: 'PENDING',
        checkoutUrl: 'https://mp.com/checkout/pref-123',
        source: 'mercadopago',
        externalId: 'pref-123',
        gateway: 'mercadopago',
        installments: null,
        installmentValue: null,
        paidAt: null,
        appointmentId: 'apt-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.createCheckout(
        { appointmentId: 'apt-1', amount: 500, description: 'Tatuagem sessão 1' },
        'studio-1',
      );

      expect(result.checkoutUrl).toBe('https://mp.com/checkout/pref-123');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.mercadopago.com/checkout/preferences',
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({ unit_price: 500 }),
          ]),
        }),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer TEST_TOKEN' }),
        }),
      );
    });

    it('throws BadRequestException if studio has no MP access token', async () => {
      prisma.appointment.findFirst.mockResolvedValue({ id: 'apt-1', studioId: 'studio-1' });
      prisma.studio.findUnique.mockResolvedValue({ id: 'studio-1', mpAccessToken: null });
      await expect(
        service.createCheckout({ appointmentId: 'apt-1', amount: 500 }, 'studio-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException if appointment not in studio', async () => {
      prisma.appointment.findFirst.mockResolvedValue(null);
      await expect(
        service.createCheckout({ appointmentId: 'bad', amount: 500 }, 'studio-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws InternalServerErrorException if MP API call fails', async () => {
      prisma.appointment.findFirst.mockResolvedValue({ id: 'apt-1', studioId: 'studio-1' });
      prisma.studio.findUnique.mockResolvedValue({
        id: 'studio-1',
        mpAccessToken: 'TEST_TOKEN',
      });
      mockedAxios.post.mockRejectedValue({ response: { status: 500 } });
      await expect(
        service.createCheckout({ appointmentId: 'apt-1', amount: 500 }, 'studio-1'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ── handleMpWebhook ───────────────────────────────────────────────────────

  describe('handleMpWebhook', () => {
    it('marks payment as PAID when MP status is approved', async () => {
      prisma.studio.findUnique.mockResolvedValue({
        id: 'studio-1',
        mpAccessToken: 'TEST_TOKEN',
      });
      mockedAxios.get.mockResolvedValue({
        data: {
          status: 'approved',
          metadata: { payment_id: 'pay-1' },
          installments: 3,
        },
      });
      prisma.payment.findFirst.mockResolvedValue({
        id: 'pay-1',
        status: 'PENDING',
      });
      prisma.payment.update.mockResolvedValue({
        id: 'pay-1',
        status: 'PAID',
      });

      await service.handleMpWebhook('studio-1', 'mp-payment-123');

      expect(prisma.payment.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 'pay-1',
            appointment: { studioId: 'studio-1' },
          }),
        }),
      );
      expect(prisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'PAID',
            paidAt: expect.any(Date),
          }),
        }),
      );
    });

    it('is idempotent — skips update if already PAID', async () => {
      prisma.studio.findUnique.mockResolvedValue({
        id: 'studio-1',
        mpAccessToken: 'TEST_TOKEN',
      });
      mockedAxios.get.mockResolvedValue({
        data: { status: 'approved', metadata: { payment_id: 'pay-1' }, installments: 1 },
      });
      prisma.payment.findFirst.mockResolvedValue({
        id: 'pay-1',
        status: 'PAID',
      });

      await service.handleMpWebhook('studio-1', 'mp-payment-123');

      expect(prisma.payment.update).not.toHaveBeenCalled();
    });

    it('returns silently if studio has no mpAccessToken', async () => {
      prisma.studio.findUnique.mockResolvedValue({
        id: 'studio-1',
        mpAccessToken: null,
      });

      await expect(service.handleMpWebhook('studio-1', 'mp-pay-1')).resolves.toBeUndefined();
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('returns silently if MP payment has no metadata.payment_id', async () => {
      prisma.studio.findUnique.mockResolvedValue({ id: 'studio-1', mpAccessToken: 'tok' });
      mockedAxios.get.mockResolvedValue({ data: { status: 'approved', metadata: {} } });

      await expect(service.handleMpWebhook('studio-1', 'mp-pay-1')).resolves.toBeUndefined();
      expect(prisma.payment.findFirst).not.toHaveBeenCalled();
    });

    it('returns silently if MP API GET call fails', async () => {
      prisma.studio.findUnique.mockResolvedValue({ id: 'studio-1', mpAccessToken: 'tok' });
      mockedAxios.get.mockRejectedValue(new Error('network error'));

      await expect(service.handleMpWebhook('studio-1', 'mp-pay-1')).resolves.toBeUndefined();
      expect(prisma.payment.findFirst).not.toHaveBeenCalled();
    });

    it('does not update payment belonging to a different studio', async () => {
      prisma.studio.findUnique.mockResolvedValue({
        id: 'studio-1',
        mpAccessToken: 'TEST_TOKEN',
      });
      mockedAxios.get.mockResolvedValue({
        data: { status: 'approved', metadata: { payment_id: 'pay-other-studio' }, installments: 1 },
      });
      // Simulate payment not found for this studio (it belongs to another studio)
      prisma.payment.findFirst.mockResolvedValue(null);

      await service.handleMpWebhook('studio-1', 'mp-payment-123');

      expect(prisma.payment.update).not.toHaveBeenCalled();
    });
  });
});

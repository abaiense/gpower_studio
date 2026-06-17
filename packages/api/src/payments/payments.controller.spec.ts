import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockUser = {
  sub: 'user-1',
  email: 'owner@studio.com',
  role: 'OWNER',
  studioId: 'studio-1',
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

const createServiceMock = () => ({
  create: jest.fn(),
  findByAppointment: jest.fn(),
  markPaid: jest.fn(),
  refund: jest.fn(),
});

// ── Test suite ────────────────────────────────────────────────────────────────

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let service: ReturnType<typeof createServiceMock>;

  beforeEach(async () => {
    service = createServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [{ provide: PaymentsService, useValue: service }],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
  });

  describe('POST /payments', () => {
    it('creates a payment scoped to the current studio', async () => {
      const dto = { appointmentId: 'appt-1', amount: 500, method: 'PIX' as const };
      service.create.mockResolvedValue(mockPayment);

      const result = await controller.create(dto, mockUser);

      expect(result).toEqual(mockPayment);
      expect(service.create).toHaveBeenCalledWith(dto, 'studio-1');
    });
  });

  describe('GET /payments/appointment/:appointmentId', () => {
    it('returns payments for an appointment', async () => {
      service.findByAppointment.mockResolvedValue([mockPayment]);

      const result = await controller.findByAppointment('appt-1', mockUser);

      expect(result).toEqual([mockPayment]);
      expect(service.findByAppointment).toHaveBeenCalledWith('appt-1', 'studio-1');
    });

    it('returns empty array when no payments exist', async () => {
      service.findByAppointment.mockResolvedValue([]);

      const result = await controller.findByAppointment('appt-1', mockUser);

      expect(result).toEqual([]);
    });
  });

  describe('PATCH /payments/:id/paid', () => {
    it('marks payment as paid', async () => {
      const paidPayment = { ...mockPayment, status: 'PAID', paidAt: new Date() };
      service.markPaid.mockResolvedValue(paidPayment);

      const result = await controller.markPaid('pay-1', mockUser);

      expect(result.status).toBe('PAID');
      expect(service.markPaid).toHaveBeenCalledWith('pay-1', 'studio-1');
    });
  });

  describe('PATCH /payments/:id/refund', () => {
    it('refunds a paid payment', async () => {
      const refundedPayment = { ...mockPayment, status: 'REFUNDED' };
      service.refund.mockResolvedValue(refundedPayment);

      const result = await controller.refund('pay-1', mockUser);

      expect(result.status).toBe('REFUNDED');
      expect(service.refund).toHaveBeenCalledWith('pay-1', 'studio-1');
    });
  });
});

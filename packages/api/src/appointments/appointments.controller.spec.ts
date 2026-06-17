import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockUser = {
  sub: 'user-1',
  email: 'owner@studio.com',
  role: 'OWNER',
  studioId: 'studio-1',
};

const mockAppointment = {
  id: 'appt-1',
  startAt: new Date('2026-06-20T10:00:00Z'),
  endAt: new Date('2026-06-20T12:00:00Z'),
  status: 'PENDING',
  notes: null,
  totalPrice: null,
  depositAmount: null,
  depositPaidAt: null,
  sessionNumber: null,
  clientId: 'client-1',
  artistId: 'artist-1',
  serviceId: 'service-1',
  studioId: 'studio-1',
  projectId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const createServiceMock = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  getAvailability: jest.fn(),
});

// ── Test suite ────────────────────────────────────────────────────────────────

describe('AppointmentsController', () => {
  let controller: AppointmentsController;
  let service: ReturnType<typeof createServiceMock>;

  beforeEach(async () => {
    service = createServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentsController],
      providers: [
        { provide: AppointmentsService, useValue: service },
      ],
    }).compile();

    controller = module.get<AppointmentsController>(AppointmentsController);
  });

  describe('POST /appointments', () => {
    it('creates an appointment scoped to the current studio', async () => {
      const dto = {
        startAt: '2026-06-20T10:00:00Z',
        endAt: '2026-06-20T12:00:00Z',
        clientId: 'client-1',
        artistId: 'artist-1',
        serviceId: 'service-1',
      };
      service.create.mockResolvedValue(mockAppointment);

      const result = await controller.create(dto, mockUser);

      expect(result).toEqual(mockAppointment);
      expect(service.create).toHaveBeenCalledWith(dto, 'studio-1');
    });
  });

  describe('GET /appointments', () => {
    it('returns all appointments with query filters', async () => {
      const query = { startDate: '2026-06-20', endDate: '2026-06-21' };
      service.findAll.mockResolvedValue([mockAppointment]);

      const result = await controller.findAll(query as any, mockUser);

      expect(result).toEqual([mockAppointment]);
      expect(service.findAll).toHaveBeenCalledWith('studio-1', query);
    });

    it('returns empty array when no appointments exist', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll({}, mockUser);

      expect(result).toEqual([]);
    });
  });

  describe('GET /appointments/:id', () => {
    it('returns the appointment by id', async () => {
      service.findById.mockResolvedValue(mockAppointment);

      const result = await controller.findById('appt-1', mockUser);

      expect(result).toEqual(mockAppointment);
      expect(service.findById).toHaveBeenCalledWith('appt-1', 'studio-1');
    });
  });

  describe('PATCH /appointments/:id', () => {
    it('updates and returns the appointment', async () => {
      const dto = { status: 'CONFIRMED' as const };
      const updated = { ...mockAppointment, status: 'CONFIRMED' };
      service.update.mockResolvedValue(updated);

      const result = await controller.update('appt-1', dto, mockUser);

      expect(result.status).toBe('CONFIRMED');
      expect(service.update).toHaveBeenCalledWith('appt-1', dto, 'studio-1');
    });
  });

  describe('DELETE /appointments/:id', () => {
    it('removes the appointment (returns void)', async () => {
      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove('appt-1', mockUser);

      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith('appt-1', 'studio-1');
    });
  });

  describe('GET /appointments/availability', () => {
    it('returns available slots for artist and date', async () => {
      const slots = [
        { startAt: '2026-06-19T09:00:00.000Z', endAt: '2026-06-19T10:00:00.000Z' },
        { startAt: '2026-06-19T10:00:00.000Z', endAt: '2026-06-19T11:00:00.000Z' },
      ];
      service.getAvailability.mockResolvedValue(slots);

      const query = { artistId: 'artist-1', date: '2026-06-19' };
      const result = await controller.getAvailability(query as any, mockUser);

      expect(result).toEqual(slots);
      expect(service.getAvailability).toHaveBeenCalledWith(
        'studio-1',
        'artist-1',
        '2026-06-19',
      );
    });

    it('returns empty array when no availability', async () => {
      service.getAvailability.mockResolvedValue([]);

      const query = { artistId: 'artist-1', date: '2026-06-19' };
      const result = await controller.getAvailability(query as any, mockUser);

      expect(result).toEqual([]);
    });
  });
});

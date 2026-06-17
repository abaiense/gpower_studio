import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { PrismaService } from '../prisma/prisma.service';

// ── Helpers ──────────────────────────────────────────────────────────────────

const mockAppointment = {
  id: 'appt-1',
  startAt: new Date('2026-06-20T10:00:00Z'),
  endAt: new Date('2026-06-20T12:00:00Z'),
  status: 'PENDING' as const,
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

const appointmentInclude = {
  client: { select: { id: true, firstName: true, lastName: true, phone: true } },
  artist: { select: { id: true, firstName: true, lastName: true } },
  service: { select: { id: true, name: true, category: true, durationMin: true } },
};

const createPrismaMock = () => ({
  appointment: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  artistSchedule: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
  },
});

// ── Test suite ────────────────────────────────────────────────────────────────

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
  });

  // ── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('creates an appointment with required fields', async () => {
      const dto = {
        startAt: '2026-06-20T10:00:00Z',
        endAt: '2026-06-20T12:00:00Z',
        clientId: 'client-1',
        artistId: 'artist-1',
        serviceId: 'service-1',
      };
      // checkConflict returns null (no conflict)
      prisma.appointment.findFirst.mockResolvedValue(null);
      prisma.appointment.create.mockResolvedValue(mockAppointment);

      const result = await service.create(dto, 'studio-1');

      expect(result).toEqual(mockAppointment);
      expect(prisma.appointment.create).toHaveBeenCalledWith({
        data: {
          clientId: 'client-1',
          artistId: 'artist-1',
          serviceId: 'service-1',
          startAt: new Date(dto.startAt),
          endAt: new Date(dto.endAt),
          studioId: 'studio-1',
        },
        include: appointmentInclude,
      });
    });

    it('creates an appointment with optional fields', async () => {
      const dto = {
        startAt: '2026-06-20T14:00:00Z',
        endAt: '2026-06-20T16:00:00Z',
        clientId: 'client-1',
        artistId: 'artist-1',
        serviceId: 'service-1',
        notes: 'Cliente quer referência de braço',
        totalPrice: 800,
        depositAmount: 200,
        sessionNumber: 1,
      };
      const expected = { ...mockAppointment, ...dto };
      prisma.appointment.findFirst.mockResolvedValue(null);
      prisma.appointment.create.mockResolvedValue(expected);

      const result = await service.create(dto, 'studio-1');

      expect(result.notes).toBe('Cliente quer referência de braço');
      expect(result.totalPrice).toBe(800);
      expect(result.sessionNumber).toBe(1);
    });

    it('throws ConflictException when a blocking appointment overlaps', async () => {
      const dto = {
        startAt: '2026-06-20T10:00:00Z',
        endAt: '2026-06-20T12:00:00Z',
        clientId: 'client-1',
        artistId: 'artist-1',
        serviceId: 'service-1',
      };
      // checkConflict finds an existing conflicting appointment
      prisma.appointment.findFirst.mockResolvedValue(mockAppointment);

      await expect(service.create(dto, 'studio-1')).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.appointment.create).not.toHaveBeenCalled();
    });

    it('does not throw when only CANCELLED/NO_SHOW appointments exist in slot', async () => {
      const dto = {
        startAt: '2026-06-20T10:00:00Z',
        endAt: '2026-06-20T12:00:00Z',
        clientId: 'client-1',
        artistId: 'artist-1',
        serviceId: 'service-1',
      };
      // checkConflict query (notIn CANCELLED/NO_SHOW) returns null — no conflict
      prisma.appointment.findFirst.mockResolvedValue(null);
      prisma.appointment.create.mockResolvedValue(mockAppointment);

      await expect(service.create(dto, 'studio-1')).resolves.toEqual(
        mockAppointment,
      );
    });

    it('calls conflict check before creating', async () => {
      const dto = {
        startAt: '2026-06-20T10:00:00Z',
        endAt: '2026-06-20T12:00:00Z',
        clientId: 'client-1',
        artistId: 'artist-1',
        serviceId: 'service-1',
      };
      prisma.appointment.findFirst.mockResolvedValue(null);
      prisma.appointment.create.mockResolvedValue(mockAppointment);

      await service.create(dto, 'studio-1');

      // findFirst (conflict check) is called before create
      const findFirstOrder = prisma.appointment.findFirst.mock.invocationCallOrder[0] ?? 0;
      const createOrder = prisma.appointment.create.mock.invocationCallOrder[0] ?? 0;
      expect(findFirstOrder).toBeLessThan(createOrder);
    });
  });

  // ── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns all appointments for the studio ordered by startAt', async () => {
      prisma.appointment.findMany.mockResolvedValue([mockAppointment]);

      const result = await service.findAll('studio-1');

      expect(result).toEqual([mockAppointment]);
      expect(prisma.appointment.findMany).toHaveBeenCalledWith({
        where: { studioId: 'studio-1' },
        include: appointmentInclude,
        orderBy: { startAt: 'asc' },
      });
    });

    it('filters by date range when startDate and endDate provided', async () => {
      prisma.appointment.findMany.mockResolvedValue([mockAppointment]);

      await service.findAll('studio-1', {
        startDate: '2026-06-20',
        endDate: '2026-06-21',
      });

      expect(prisma.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            startAt: {
              gte: new Date('2026-06-20'),
              lte: new Date('2026-06-21'),
            },
          }),
        }),
      );
    });

    it('filters by status', async () => {
      prisma.appointment.findMany.mockResolvedValue([mockAppointment]);

      await service.findAll('studio-1', { status: 'PENDING' });

      expect(prisma.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'PENDING' }),
        }),
      );
    });

    it('filters by artistId', async () => {
      prisma.appointment.findMany.mockResolvedValue([mockAppointment]);

      await service.findAll('studio-1', { artistId: 'artist-1' });

      expect(prisma.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ artistId: 'artist-1' }),
        }),
      );
    });

    it('combines multiple filters', async () => {
      prisma.appointment.findMany.mockResolvedValue([mockAppointment]);

      await service.findAll('studio-1', {
        startDate: '2026-06-20',
        endDate: '2026-06-21',
        status: 'CONFIRMED',
        artistId: 'artist-1',
      });

      expect(prisma.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            artistId: 'artist-1',
            status: 'CONFIRMED',
            startAt: {
              gte: new Date('2026-06-20'),
              lte: new Date('2026-06-21'),
            },
          }),
        }),
      );
    });
  });

  // ── findById ──────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('returns the appointment with full includes', async () => {
      const withRelations = {
        ...mockAppointment,
        ...appointmentInclude,
        payments: [],
        project: null,
      };
      prisma.appointment.findFirst.mockResolvedValue(withRelations);

      const result = await service.findById('appt-1', 'studio-1');

      expect(result).toEqual(withRelations);
      expect(prisma.appointment.findFirst).toHaveBeenCalledWith({
        where: { id: 'appt-1', studioId: 'studio-1' },
        include: expect.objectContaining({
          payments: true,
          project: { select: { id: true, name: true, status: true } },
        }),
      });
    });

    it('throws NotFoundException when appointment does not exist', async () => {
      prisma.appointment.findFirst.mockResolvedValue(null);

      await expect(
        service.findById('nonexistent', 'studio-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── update ────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('updates and returns the appointment', async () => {
      prisma.appointment.findFirst.mockResolvedValue(mockAppointment);
      const updateDto = { status: 'CONFIRMED' as const, notes: 'Confirmado' };
      const updated = { ...mockAppointment, ...updateDto };
      prisma.appointment.update.mockResolvedValue(updated);

      const result = await service.update('appt-1', updateDto, 'studio-1');

      expect(result.status).toBe('CONFIRMED');
      expect(result.notes).toBe('Confirmado');
      expect(prisma.appointment.update).toHaveBeenCalledWith({
        where: { id: 'appt-1' },
        data: updateDto,
        include: appointmentInclude,
      });
    });

    it('coerces startAt and endAt to Date objects', async () => {
      prisma.appointment.findFirst
        .mockResolvedValueOnce(mockAppointment) // findById
        .mockResolvedValueOnce(null);           // checkConflict — no conflict
      prisma.appointment.update.mockResolvedValue(mockAppointment);

      await service.update('appt-1', { startAt: '2026-06-21T09:00:00Z' }, 'studio-1');

      expect(prisma.appointment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            startAt: new Date('2026-06-21T09:00:00Z'),
          }),
        }),
      );
    });

    it('calls conflict check with excludeId when time changes', async () => {
      prisma.appointment.findFirst
        .mockResolvedValueOnce(mockAppointment) // findById
        .mockResolvedValueOnce(null);           // checkConflict — no conflict
      prisma.appointment.update.mockResolvedValue(mockAppointment);

      await service.update(
        'appt-1',
        { startAt: '2026-06-21T09:00:00Z', endAt: '2026-06-21T11:00:00Z' },
        'studio-1',
      );

      // Second findFirst call is the conflict check with excludeId
      expect(prisma.appointment.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: { not: 'appt-1' },
          }),
        }),
      );
    });

    it('throws ConflictException when update causes time overlap', async () => {
      const conflictingAppt = { ...mockAppointment, id: 'appt-2' };
      prisma.appointment.findFirst
        .mockResolvedValueOnce(mockAppointment) // findById
        .mockResolvedValueOnce(conflictingAppt); // checkConflict — conflict found

      await expect(
        service.update(
          'appt-1',
          { startAt: '2026-06-20T09:00:00Z', endAt: '2026-06-20T11:00:00Z' },
          'studio-1',
        ),
      ).rejects.toThrow(ConflictException);

      expect(prisma.appointment.update).not.toHaveBeenCalled();
    });

    it('skips conflict check when neither startAt nor endAt changes', async () => {
      prisma.appointment.findFirst.mockResolvedValue(mockAppointment);
      prisma.appointment.update.mockResolvedValue(mockAppointment);

      await service.update('appt-1', { notes: 'Updated note' }, 'studio-1');

      // findFirst called once for findById, not again for conflict check
      expect(prisma.appointment.findFirst).toHaveBeenCalledTimes(1);
    });
  });

  // ── remove ────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('deletes the appointment', async () => {
      prisma.appointment.findFirst.mockResolvedValue(mockAppointment);
      prisma.appointment.delete.mockResolvedValue(mockAppointment);

      await service.remove('appt-1', 'studio-1');

      expect(prisma.appointment.delete).toHaveBeenCalledWith({
        where: { id: 'appt-1' },
      });
    });

    it('throws NotFoundException when deleting nonexistent appointment', async () => {
      prisma.appointment.findFirst.mockResolvedValue(null);

      await expect(
        service.remove('nonexistent', 'studio-1'),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.appointment.delete).not.toHaveBeenCalled();
    });
  });

  // ── getAvailability ───────────────────────────────────────────────────────

  describe('getAvailability', () => {
    const mockSchedule = {
      id: 'sched-1',
      artistId: 'artist-1',
      dayOfWeek: 5, // Friday
      startTime: '09:00',
      endTime: '11:00', // 2 slots of 60 min
      isActive: true,
    };

    it('returns available 60-min slots excluding booked ones', async () => {
      // Date: a Friday
      const date = '2026-06-19'; // 2026-06-19 is a Friday (dayOfWeek=5)

      // One existing appointment occupying 09:00–10:00 slot
      const bookedAppt = {
        ...mockAppointment,
        startAt: new Date(`${date}T09:00:00`),
        endAt: new Date(`${date}T10:00:00`),
      };

      prisma.artistSchedule.findFirst.mockResolvedValue(mockSchedule);
      prisma.appointment.findMany.mockResolvedValue([bookedAppt]);

      const result = await service.getAvailability('studio-1', 'artist-1', date);

      // Should have only 10:00–11:00 slot (09:00–10:00 is booked)
      // Use the same local-time construction the service uses to get expected ISO strings
      const expectedStart = new Date(`${date}T00:00:00`);
      expectedStart.setHours(10, 0, 0, 0);
      const expectedEnd = new Date(`${date}T00:00:00`);
      expectedEnd.setHours(11, 0, 0, 0);

      expect(result).toHaveLength(1);
      expect(result[0]!.startAt).toBe(expectedStart.toISOString());
      expect(result[0]!.endAt).toBe(expectedEnd.toISOString());
    });

    it('returns all slots when no appointments exist', async () => {
      const date = '2026-06-19';

      prisma.artistSchedule.findFirst.mockResolvedValue(mockSchedule);
      prisma.appointment.findMany.mockResolvedValue([]);

      const result = await service.getAvailability('studio-1', 'artist-1', date);

      // 09:00–10:00 and 10:00–11:00
      expect(result).toHaveLength(2);
    });

    it('returns empty array when no schedule found for that day', async () => {
      prisma.artistSchedule.findFirst.mockResolvedValue(null);

      const result = await service.getAvailability('studio-1', 'artist-1', '2026-06-19');

      expect(result).toEqual([]);
      expect(prisma.appointment.findMany).not.toHaveBeenCalled();
    });

    it('returns empty array when all slots are booked', async () => {
      const date = '2026-06-19';
      const slot1 = {
        ...mockAppointment,
        id: 'appt-s1',
        startAt: new Date(`${date}T09:00:00`),
        endAt: new Date(`${date}T10:00:00`),
      };
      const slot2 = {
        ...mockAppointment,
        id: 'appt-s2',
        startAt: new Date(`${date}T10:00:00`),
        endAt: new Date(`${date}T11:00:00`),
      };

      prisma.artistSchedule.findFirst.mockResolvedValue(mockSchedule);
      prisma.appointment.findMany.mockResolvedValue([slot1, slot2]);

      const result = await service.getAvailability('studio-1', 'artist-1', date);

      expect(result).toEqual([]);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
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

const mockArtist = {
  id: 'artist-1',
  firstName: 'Ana',
  lastName: 'Lima',
  commissionType: 'PERCENTAGE' as const,
  commissionValue: 50,
  studioId: 'studio-1',
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
  artist: {
    findFirst: jest.fn(),
  },
  payment: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
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
        include: expect.objectContaining({
          artist: appointmentInclude.artist,
          service: expect.objectContaining({
            select: expect.objectContaining({ name: true }),
          }),
        }),
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

  // ── closeSession ──────────────────────────────────────────────────────────

  describe('closeSession', () => {
    const dto = {
      totalPrice: 1000,
      payments: [{ method: 'PIX' as const, amount: 1000 }],
    };

    it('calculates PERCENTAGE commission correctly', async () => {
      const appt = { ...mockAppointment, depositAmount: 200 };
      prisma.appointment.findFirst.mockResolvedValue(appt);
      prisma.artist.findFirst.mockResolvedValue(mockArtist); // 50%
      const completedAppt = { ...appt, status: 'COMPLETED', totalPrice: 1000 };
      prisma.$transaction.mockResolvedValue([completedAppt]);

      const result = await service.closeSession('appt-1', dto, 'studio-1');

      // depositDeducted = min(200, 1000) = 200
      // netRevenue = 1000 - 200 = 800
      // artistEarns = 800 * 0.5 = 400
      // studioEarns = 800 - 400 = 400
      expect(result.commission.depositDeducted).toBe(200);
      expect(result.commission.netRevenue).toBe(800);
      expect(result.commission.artistEarns).toBe(400);
      expect(result.commission.studioEarns).toBe(400);
    });

    it('calculates FIXED commission correctly', async () => {
      const appt = { ...mockAppointment, depositAmount: 0 };
      const fixedArtist = { ...mockArtist, commissionType: 'FIXED' as const, commissionValue: 300 };
      prisma.appointment.findFirst.mockResolvedValue(appt);
      prisma.artist.findFirst.mockResolvedValue(fixedArtist);
      const completedAppt = { ...appt, status: 'COMPLETED', totalPrice: 1000 };
      prisma.$transaction.mockResolvedValue([completedAppt]);

      const result = await service.closeSession('appt-1', dto, 'studio-1');

      // netRevenue = 1000 - 0 = 1000
      // artistEarns = 300 (fixed)
      // studioEarns = 1000 - 300 = 700
      expect(result.commission.artistEarns).toBe(300);
      expect(result.commission.studioEarns).toBe(700);
    });

    it('throws BadRequestException when appointment is already COMPLETED', async () => {
      prisma.appointment.findFirst.mockResolvedValue({
        ...mockAppointment,
        status: 'COMPLETED',
      });

      await expect(
        service.closeSession('appt-1', dto, 'studio-1'),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when appointment does not exist', async () => {
      prisma.appointment.findFirst.mockResolvedValue(null);

      await expect(
        service.closeSession('nonexistent', dto, 'studio-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('deposits larger than totalPrice are capped at totalPrice', async () => {
      const appt = { ...mockAppointment, depositAmount: 1500 };
      prisma.appointment.findFirst.mockResolvedValue(appt);
      prisma.artist.findFirst.mockResolvedValue(mockArtist);
      const completedAppt = { ...appt, status: 'COMPLETED', totalPrice: 1000 };
      prisma.$transaction.mockResolvedValue([completedAppt]);

      const result = await service.closeSession('appt-1', dto, 'studio-1');

      // depositDeducted = min(1500, 1000) = 1000 (capped)
      expect(result.commission.depositDeducted).toBe(1000);
      expect(result.commission.netRevenue).toBe(0);
    });
  });

  // ── getDailyCashReport ────────────────────────────────────────────────────

  describe('getDailyCashReport', () => {
    it('aggregates revenue and payment breakdown correctly', async () => {
      const completedAppt = {
        ...mockAppointment,
        status: 'COMPLETED',
        totalPrice: 800,
        depositAmount: 200,
        artist: {
          id: 'artist-1',
          firstName: 'Ana',
          lastName: 'Lima',
          commissionType: 'PERCENTAGE' as const,
          commissionValue: 50,
        },
        payments: [
          { id: 'pay-1', method: 'PIX', amount: 600, status: 'PAID', appointmentId: 'appt-1' },
          { id: 'pay-2', method: 'CASH', amount: 200, status: 'PAID', appointmentId: 'appt-1' },
        ],
      };

      prisma.appointment.findMany
        .mockResolvedValueOnce([completedAppt]) // COMPLETED appointments
        .mockResolvedValueOnce([completedAppt]); // all appointments for day

      const result = await service.getDailyCashReport('studio-1', '2026-06-20');

      expect(result.date).toBe('2026-06-20');
      expect(result.totalRevenue).toBe(800);
      expect(result.completedAppointments).toBe(1);
      expect(result.paymentBreakdown['PIX']).toBe(600);
      expect(result.paymentBreakdown['CASH']).toBe(200);
      expect(result.artistSummary).toHaveLength(1);
      expect(result.artistSummary[0]!.artistName).toBe('Ana Lima');
      // depositDeducted = min(200, 800) = 200, netRevenue = 600, artistEarns = 300, studioEarns = 300
      expect(result.artistSummary[0]!.artistEarns).toBe(300);
      expect(result.artistSummary[0]!.studioEarns).toBe(300);
    });

    it('returns zero totals when no completed appointments', async () => {
      prisma.appointment.findMany
        .mockResolvedValueOnce([]) // no COMPLETED
        .mockResolvedValueOnce([]); // no appointments at all

      const result = await service.getDailyCashReport('studio-1', '2026-06-20');

      expect(result.totalRevenue).toBe(0);
      expect(result.completedAppointments).toBe(0);
      expect(result.totalAppointments).toBe(0);
      expect(result.paymentBreakdown).toEqual({});
      expect(result.artistSummary).toEqual([]);
    });
  });
});

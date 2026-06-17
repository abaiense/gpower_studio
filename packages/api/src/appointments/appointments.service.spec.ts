import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
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
      prisma.appointment.create.mockResolvedValue(mockAppointment);

      const result = await service.create(dto, 'studio-1');

      expect(result).toEqual(mockAppointment);
      expect(prisma.appointment.create).toHaveBeenCalledWith({
        data: {
          ...dto,
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
      prisma.appointment.create.mockResolvedValue(expected);

      const result = await service.create(dto, 'studio-1');

      expect(result.notes).toBe('Cliente quer referência de braço');
      expect(result.totalPrice).toBe(800);
      expect(result.sessionNumber).toBe(1);
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
      prisma.appointment.findFirst.mockResolvedValue(mockAppointment);
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
});

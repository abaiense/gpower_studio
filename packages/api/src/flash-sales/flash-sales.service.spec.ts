import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FlashSalesService } from './flash-sales.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

const mockSlot = {
  id: 'flash-1',
  title: 'Slot relâmpago',
  description: null,
  originalPrice: 800,
  discountPrice: 500,
  sessionAt: new Date('2026-07-01T10:00:00Z'),
  claimDeadline: futureDate,
  status: 'OPEN' as const,
  claimToken: 'abc123',
  artistId: 'artist-1',
  serviceId: 'service-1',
  studioId: 'studio-1',
  claimedByClientId: null,
  claimedAt: null,
  appointmentId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const createPrismaMock = () => ({
  flashSlot: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  client: {
    findMany: jest.fn(),
  },
});

const mockNotifications = {
  send: jest.fn().mockResolvedValue(undefined),
};

describe('FlashSalesService', () => {
  let service: FlashSalesService;
  let mockPrisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    mockPrisma = createPrismaMock();
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlashSalesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotifications },
      ],
    }).compile();

    service = module.get<FlashSalesService>(FlashSalesService);
  });

  describe('create', () => {
    it('creates flash slot with unique claimToken and triggers broadcast', async () => {
      mockPrisma.flashSlot.create.mockResolvedValue(mockSlot);
      mockPrisma.client.findMany.mockResolvedValue([
        { id: 'c1', firstName: 'Ana', phone: '+55119' },
      ]);

      const result = await service.create(
        {
          title: 'Slot relâmpago',
          originalPrice: 800,
          discountPrice: 500,
          sessionAt: '2026-07-01T10:00:00Z',
          claimDeadline: futureDate.toISOString(),
          artistId: 'artist-1',
          serviceId: 'service-1',
        },
        'studio-1',
      );

      expect(result.id).toBe('flash-1');
      expect(mockPrisma.flashSlot.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            studioId: 'studio-1',
            status: 'OPEN',
            claimToken: expect.any(String),
          }),
        }),
      );
      expect(mockNotifications.send).toHaveBeenCalledWith(
        expect.objectContaining({ template: 'FLASH_SALE_BROADCAST' }),
      );
    });

    it('throws BadRequestException if discountPrice >= originalPrice', async () => {
      await expect(
        service.create(
          {
            title: 'Bad',
            originalPrice: 500,
            discountPrice: 600,
            sessionAt: '2026-07-01T10:00:00Z',
            claimDeadline: futureDate.toISOString(),
            artistId: 'artist-1',
            serviceId: 'service-1',
          },
          'studio-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('skips broadcast if no clients have phone numbers', async () => {
      mockPrisma.flashSlot.create.mockResolvedValue(mockSlot);
      mockPrisma.client.findMany.mockResolvedValue([]);

      await service.create(
        {
          title: 'Slot relâmpago',
          originalPrice: 800,
          discountPrice: 500,
          sessionAt: '2026-07-01T10:00:00Z',
          claimDeadline: futureDate.toISOString(),
          artistId: 'artist-1',
          serviceId: 'service-1',
        },
        'studio-1',
      );

      expect(mockNotifications.send).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('returns slots ordered by createdAt desc', async () => {
      mockPrisma.flashSlot.findMany.mockResolvedValue([mockSlot]);
      const result = await service.findAll('studio-1', {});
      expect(result).toHaveLength(1);
      expect(mockPrisma.flashSlot.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
      );
    });

    it('filters by status when provided', async () => {
      mockPrisma.flashSlot.findMany.mockResolvedValue([mockSlot]);
      await service.findAll('studio-1', { status: 'OPEN' });
      expect(mockPrisma.flashSlot.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'OPEN' }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('returns slot by id and studioId', async () => {
      mockPrisma.flashSlot.findFirst.mockResolvedValue(mockSlot);
      const result = await service.findOne('flash-1', 'studio-1');
      expect(result.id).toBe('flash-1');
    });

    it('throws NotFoundException if not found', async () => {
      mockPrisma.flashSlot.findFirst.mockResolvedValue(null);
      await expect(service.findOne('bad', 'studio-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancel', () => {
    it('cancels an OPEN slot', async () => {
      mockPrisma.flashSlot.findFirst.mockResolvedValue(mockSlot);
      mockPrisma.flashSlot.update.mockResolvedValue({ ...mockSlot, status: 'CANCELLED' });
      const result = await service.cancel('flash-1', 'studio-1');
      expect(result.status).toBe('CANCELLED');
      expect(mockPrisma.flashSlot.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'CANCELLED' },
        }),
      );
    });

    it('throws BadRequestException if slot is not OPEN', async () => {
      mockPrisma.flashSlot.findFirst.mockResolvedValue({ ...mockSlot, status: 'CLAIMED' });
      await expect(service.cancel('flash-1', 'studio-1')).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException if slot not found', async () => {
      mockPrisma.flashSlot.findFirst.mockResolvedValue(null);
      await expect(service.cancel('bad', 'studio-1')).rejects.toThrow(NotFoundException);
    });
  });
});

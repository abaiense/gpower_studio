import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ServicesService } from './services.service';
import { PrismaService } from '../prisma/prisma.service';

// ── Helpers ──────────────────────────────────────────────────────────────────

const mockService = {
  id: 'service-1',
  name: 'Tatuagem Preta',
  description: 'Tatuagem em preto e cinza',
  category: 'TATTOO' as const,
  durationMin: 120,
  basePrice: 500,
  isActive: true,
  studioId: 'studio-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ── Mock factory ──────────────────────────────────────────────────────────────

const createPrismaMock = () => ({
  service: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
});

// ── Test suite ────────────────────────────────────────────────────────────────

describe('ServicesService', () => {
  let service: ServicesService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
  });

  // ── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('creates a service with required fields', async () => {
      const dto = {
        name: 'Tatuagem Preta',
        category: 'TATTOO' as const,
        durationMin: 120,
      };
      prisma.service.create.mockResolvedValue(mockService);

      const result = await service.create(dto, 'studio-1');

      expect(result).toEqual(mockService);
      expect(prisma.service.create).toHaveBeenCalledWith({
        data: { ...dto, studioId: 'studio-1' },
      });
    });

    it('creates a service with all optional fields', async () => {
      const dto = {
        name: 'Piercing Nariz',
        category: 'PIERCING' as const,
        durationMin: 30,
        description: 'Piercing de aço cirúrgico',
        basePrice: 80,
      };
      prisma.service.create.mockResolvedValue({ ...mockService, ...dto });

      const result = await service.create(dto, 'studio-1');

      expect(result.description).toBe('Piercing de aço cirúrgico');
      expect(result.basePrice).toBe(80);
    });
  });

  // ── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns all services for the studio', async () => {
      prisma.service.findMany.mockResolvedValue([mockService]);

      const result = await service.findAll('studio-1');

      expect(result).toEqual([mockService]);
      expect(prisma.service.findMany).toHaveBeenCalledWith({
        where: { studioId: 'studio-1' },
        orderBy: { name: 'asc' },
      });
    });

    it('filters by category when provided', async () => {
      prisma.service.findMany.mockResolvedValue([mockService]);

      const result = await service.findAll('studio-1', 'TATTOO');

      expect(result).toEqual([mockService]);
      expect(prisma.service.findMany).toHaveBeenCalledWith({
        where: { studioId: 'studio-1', category: 'TATTOO' },
        orderBy: { name: 'asc' },
      });
    });

    it('returns empty array when no services match', async () => {
      prisma.service.findMany.mockResolvedValue([]);

      const result = await service.findAll('studio-1', 'PIERCING');

      expect(result).toEqual([]);
    });
  });

  // ── findById ──────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('returns the service when found in the studio', async () => {
      prisma.service.findFirst.mockResolvedValue(mockService);

      const result = await service.findById('service-1', 'studio-1');

      expect(result).toEqual(mockService);
      expect(prisma.service.findFirst).toHaveBeenCalledWith({
        where: { id: 'service-1', studioId: 'studio-1' },
      });
    });

    it('throws NotFoundException when service does not exist', async () => {
      prisma.service.findFirst.mockResolvedValue(null);

      await expect(
        service.findById('nonexistent', 'studio-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── update ────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('updates and returns the service', async () => {
      prisma.service.findFirst.mockResolvedValue(mockService);
      const updateDto = { name: 'Tatuagem Colorida', basePrice: 800 };
      const updated = { ...mockService, ...updateDto };
      prisma.service.update.mockResolvedValue(updated);

      const result = await service.update('service-1', updateDto, 'studio-1');

      expect(result.name).toBe('Tatuagem Colorida');
      expect(result.basePrice).toBe(800);
      expect(prisma.service.update).toHaveBeenCalledWith({
        where: { id: 'service-1' },
        data: updateDto,
      });
    });

    it('throws NotFoundException when updating nonexistent service', async () => {
      prisma.service.findFirst.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { name: 'X' }, 'studio-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── remove ────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('deletes the service', async () => {
      prisma.service.findFirst.mockResolvedValue(mockService);
      prisma.service.delete.mockResolvedValue(mockService);

      await service.remove('service-1', 'studio-1');

      expect(prisma.service.delete).toHaveBeenCalledWith({
        where: { id: 'service-1' },
      });
    });

    it('throws NotFoundException when deleting nonexistent service', async () => {
      prisma.service.findFirst.mockResolvedValue(null);

      await expect(
        service.remove('nonexistent', 'studio-1'),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.service.delete).not.toHaveBeenCalled();
    });
  });
});

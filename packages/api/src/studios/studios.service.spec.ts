import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { StudiosService } from './studios.service';
import { PrismaService } from '../prisma/prisma.service';

// ── Mock factory ──────────────────────────────────────────────────────────────

const createPrismaMock = () => ({
  studio: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
});

// ── Test suite ────────────────────────────────────────────────────────────────

describe('StudiosService', () => {
  let service: StudiosService;
  let mockPrisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    mockPrisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudiosService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<StudiosService>(StudiosService);
  });

  // ── getPaymentConfig ───────────────────────────────────────────────────────

  describe('getPaymentConfig', () => {
    it('returns mpConfigured=true and mpPublicKey when configured', async () => {
      mockPrisma.studio.findUnique.mockResolvedValue({
        id: 'studio-1',
        mpAccessToken: 'secret-token',
        mpPublicKey: 'pk-test',
      });
      const result = await service.getPaymentConfig('studio-1');
      expect(result.mpConfigured).toBe(true);
      expect(result.mpPublicKey).toBe('pk-test');
      expect(result).not.toHaveProperty('mpAccessToken');
    });

    it('returns mpConfigured=false when not configured', async () => {
      mockPrisma.studio.findUnique.mockResolvedValue({
        id: 'studio-1',
        mpAccessToken: null,
        mpPublicKey: null,
      });
      const result = await service.getPaymentConfig('studio-1');
      expect(result.mpConfigured).toBe(false);
      expect(result.mpPublicKey).toBeNull();
    });

    it('throws NotFoundException if studio not found', async () => {
      mockPrisma.studio.findUnique.mockResolvedValue(null);
      await expect(service.getPaymentConfig('bad')).rejects.toThrow(NotFoundException);
    });
  });

  // ── updatePaymentConfig ────────────────────────────────────────────────────

  describe('updatePaymentConfig', () => {
    it('updates mpAccessToken and mpPublicKey', async () => {
      mockPrisma.studio.findUnique.mockResolvedValue({ id: 'studio-1' });
      mockPrisma.studio.update.mockResolvedValue({
        id: 'studio-1',
        mpPublicKey: 'pk-new',
      });
      const result = await service.updatePaymentConfig('studio-1', {
        mpAccessToken: 'new-token',
        mpPublicKey: 'pk-new',
      });
      expect(result.id).toBe('studio-1');
      expect(result).not.toHaveProperty('mpAccessToken');
      expect(mockPrisma.studio.update).toHaveBeenCalledWith(
        expect.objectContaining({
          select: { id: true, mpPublicKey: true },
          data: expect.objectContaining({
            mpAccessToken: 'new-token',
            mpPublicKey: 'pk-new',
          }),
        }),
      );
    });

    it('only updates provided fields (partial update)', async () => {
      mockPrisma.studio.findUnique.mockResolvedValue({ id: 'studio-1' });
      mockPrisma.studio.update.mockResolvedValue({ id: 'studio-1', mpPublicKey: 'pk-old' });
      await service.updatePaymentConfig('studio-1', { mpPublicKey: 'pk-new' });
      expect(mockPrisma.studio.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { mpPublicKey: 'pk-new' },
        }),
      );
    });

    it('throws NotFoundException if studio not found', async () => {
      mockPrisma.studio.findUnique.mockResolvedValue(null);
      await expect(
        service.updatePaymentConfig('bad', { mpPublicKey: 'pk' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

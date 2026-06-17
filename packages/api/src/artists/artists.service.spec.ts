import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ArtistsService } from './artists.service';
import { PrismaService } from '../prisma/prisma.service';

// ── Helpers ──────────────────────────────────────────────────────────────────

const mockArtist = {
  id: 'artist-1',
  firstName: 'Carlos',
  lastName: 'Tattoo',
  bio: 'Specialist in blackwork',
  photoUrl: null,
  instagram: '@carlostattoo',
  styles: ['blackwork'],
  isActive: true,
  studioId: 'studio-1',
  commissionType: 'PERCENTAGE' as const,
  commissionValue: 50,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockSchedule = {
  id: 'schedule-1',
  artistId: 'artist-1',
  dayOfWeek: 1,
  startTime: '09:00',
  endTime: '18:00',
  isActive: true,
};

const mockUserRelation = { id: 'user-1', email: 'carlos@studio.com' };

// ── Mock factory ──────────────────────────────────────────────────────────────

const createPrismaMock = () => ({
  artist: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  artistSchedule: {
    findMany: jest.fn(),
    deleteMany: jest.fn(),
    createManyAndReturn: jest.fn(),
  },
});

// ── Test suite ────────────────────────────────────────────────────────────────

describe('ArtistsService', () => {
  let service: ArtistsService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArtistsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ArtistsService>(ArtistsService);
  });

  // ── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('creates an artist without schedules', async () => {
      const dto = {
        firstName: 'Carlos',
        lastName: 'Tattoo',
        bio: 'Specialist in blackwork',
        styles: ['blackwork'],
      };
      prisma.artist.create.mockResolvedValue(mockArtist);

      const result = await service.create(dto, 'studio-1');

      expect(result).toEqual(mockArtist);
      expect(prisma.artist.create).toHaveBeenCalledWith({
        data: { ...dto, studioId: 'studio-1' },
        include: { schedules: true },
      });
    });

    it('creates an artist with schedules', async () => {
      const dto = {
        firstName: 'Carlos',
        lastName: 'Tattoo',
        schedules: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '18:00' },
          { dayOfWeek: 3, startTime: '09:00', endTime: '18:00' },
        ],
      };
      const expected = { ...mockArtist, schedules: [mockSchedule] };
      prisma.artist.create.mockResolvedValue(expected);

      const result = await service.create(dto, 'studio-1');

      expect(result).toEqual(expected);
      expect(prisma.artist.create).toHaveBeenCalledWith({
        data: {
          firstName: 'Carlos',
          lastName: 'Tattoo',
          studioId: 'studio-1',
          schedules: { create: dto.schedules },
        },
        include: { schedules: true },
      });
    });

    it('creates an artist with commission config', async () => {
      const dto = {
        firstName: 'Ana',
        lastName: 'Piercer',
        commissionType: 'FIXED' as const,
        commissionValue: 30,
      };
      prisma.artist.create.mockResolvedValue({ ...mockArtist, ...dto });

      const result = await service.create(dto, 'studio-1');

      expect(prisma.artist.create).toHaveBeenCalledWith({
        data: { ...dto, studioId: 'studio-1' },
        include: { schedules: true },
      });
      expect(result.commissionType).toBe('FIXED');
    });
  });

  // ── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns all artists for the studio', async () => {
      const artists = [
        { ...mockArtist, schedules: [mockSchedule], user: mockUserRelation },
      ];
      prisma.artist.findMany.mockResolvedValue(artists);

      const result = await service.findAll('studio-1');

      expect(result).toEqual(artists);
      expect(prisma.artist.findMany).toHaveBeenCalledWith({
        where: { studioId: 'studio-1' },
        include: { schedules: true, user: { select: { id: true, email: true } } },
        orderBy: { firstName: 'asc' },
      });
    });

    it('returns empty array when studio has no artists', async () => {
      prisma.artist.findMany.mockResolvedValue([]);

      const result = await service.findAll('studio-1');

      expect(result).toEqual([]);
    });

    it('returns only artists for the specified studio (multi-tenant isolation)', async () => {
      prisma.artist.findMany.mockResolvedValue([]);

      await service.findAll('studio-2');

      expect(prisma.artist.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { studioId: 'studio-2' } }),
      );
    });
  });

  // ── findById ──────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('returns the artist when found in the studio', async () => {
      const artist = { ...mockArtist, schedules: [mockSchedule], user: mockUserRelation };
      prisma.artist.findFirst.mockResolvedValue(artist);

      const result = await service.findById('artist-1', 'studio-1');

      expect(result).toEqual(artist);
      expect(prisma.artist.findFirst).toHaveBeenCalledWith({
        where: { id: 'artist-1', studioId: 'studio-1' },
        include: { schedules: true, user: { select: { id: true, email: true } } },
      });
    });

    it('throws NotFoundException when artist does not exist', async () => {
      prisma.artist.findFirst.mockResolvedValue(null);

      await expect(
        service.findById('nonexistent', 'studio-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when artist belongs to another studio', async () => {
      prisma.artist.findFirst.mockResolvedValue(null);

      await expect(
        service.findById('artist-1', 'studio-2'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── update ────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('updates and returns the artist', async () => {
      prisma.artist.findFirst.mockResolvedValue(mockArtist);
      const updateDto = { firstName: 'Carlos Updated' };
      const updatedArtist = { ...mockArtist, ...updateDto };
      prisma.artist.update.mockResolvedValue(updatedArtist);

      const result = await service.update('artist-1', updateDto, 'studio-1');

      expect(result.firstName).toBe('Carlos Updated');
      expect(prisma.artist.update).toHaveBeenCalledWith({
        where: { id: 'artist-1' },
        data: updateDto,
        include: { schedules: true },
      });
    });

    it('throws NotFoundException when updating nonexistent artist', async () => {
      prisma.artist.findFirst.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { firstName: 'X' }, 'studio-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('rejects cross-tenant update', async () => {
      prisma.artist.findFirst.mockResolvedValue(null);

      await expect(
        service.update('artist-1', { firstName: 'Hacker' }, 'studio-2'),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.artist.update).not.toHaveBeenCalled();
    });
  });

  // ── remove ────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('deletes the artist', async () => {
      prisma.artist.findFirst.mockResolvedValue(mockArtist);
      prisma.artist.delete.mockResolvedValue(mockArtist);

      await service.remove('artist-1', 'studio-1');

      expect(prisma.artist.delete).toHaveBeenCalledWith({
        where: { id: 'artist-1' },
      });
    });

    it('throws NotFoundException when deleting nonexistent artist', async () => {
      prisma.artist.findFirst.mockResolvedValue(null);

      await expect(
        service.remove('nonexistent', 'studio-1'),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.artist.delete).not.toHaveBeenCalled();
    });
  });

  // ── getSchedules ──────────────────────────────────────────────────────────

  describe('getSchedules', () => {
    it('returns schedules for the artist ordered by day', async () => {
      prisma.artist.findFirst.mockResolvedValue(mockArtist);
      const schedules = [mockSchedule];
      prisma.artistSchedule.findMany.mockResolvedValue(schedules);

      const result = await service.getSchedules('artist-1', 'studio-1');

      expect(result).toEqual(schedules);
      expect(prisma.artistSchedule.findMany).toHaveBeenCalledWith({
        where: { artistId: 'artist-1' },
        orderBy: { dayOfWeek: 'asc' },
      });
    });

    it('throws NotFoundException when artist does not exist', async () => {
      prisma.artist.findFirst.mockResolvedValue(null);

      await expect(
        service.getSchedules('nonexistent', 'studio-1'),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.artistSchedule.findMany).not.toHaveBeenCalled();
    });
  });

  // ── upsertSchedules ───────────────────────────────────────────────────────

  describe('upsertSchedules', () => {
    it('replaces all schedules for the artist', async () => {
      prisma.artist.findFirst.mockResolvedValue(mockArtist);
      prisma.artistSchedule.deleteMany.mockResolvedValue({ count: 3 });
      const newSchedules = [
        { dayOfWeek: 1, startTime: '10:00', endTime: '19:00', isActive: true },
        { dayOfWeek: 2, startTime: '10:00', endTime: '19:00', isActive: true },
      ];
      const created = newSchedules.map((s, i) => ({ ...s, id: `sched-${i}`, artistId: 'artist-1' }));
      prisma.artistSchedule.createManyAndReturn.mockResolvedValue(created);

      const result = await service.upsertSchedules('artist-1', newSchedules, 'studio-1');

      expect(result).toEqual(created);
      expect(prisma.artistSchedule.deleteMany).toHaveBeenCalledWith({
        where: { artistId: 'artist-1' },
      });
      expect(prisma.artistSchedule.createManyAndReturn).toHaveBeenCalledWith({
        data: newSchedules.map((s) => ({
          artistId: 'artist-1',
          ...s,
        })),
      });
    });

    it('returns empty array when clearing all schedules', async () => {
      prisma.artist.findFirst.mockResolvedValue(mockArtist);
      prisma.artistSchedule.deleteMany.mockResolvedValue({ count: 3 });
      prisma.artistSchedule.createManyAndReturn.mockResolvedValue([]);

      const result = await service.upsertSchedules('artist-1', [], 'studio-1');

      expect(result).toEqual([]);
      expect(prisma.artistSchedule.createManyAndReturn).not.toHaveBeenCalled();
    });

    it('throws NotFoundException for nonexistent artist', async () => {
      prisma.artist.findFirst.mockResolvedValue(null);

      await expect(
        service.upsertSchedules('nonexistent', [], 'studio-1'),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.artistSchedule.deleteMany).not.toHaveBeenCalled();
    });
  });
});

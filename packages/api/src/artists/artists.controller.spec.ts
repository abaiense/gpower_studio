import { Test, TestingModule } from '@nestjs/testing';
import { ArtistsController } from './artists.controller';
import { ArtistsService } from './artists.service';

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockUser = {
  sub: 'user-1',
  email: 'owner@studio.com',
  role: 'OWNER',
  studioId: 'studio-1',
};

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
  commissionType: 'PERCENTAGE',
  commissionValue: 50,
  createdAt: new Date(),
  updatedAt: new Date(),
  schedules: [],
  user: { id: 'user-1', email: 'carlos@studio.com' },
};

const mockSchedule = {
  id: 'schedule-1',
  artistId: 'artist-1',
  dayOfWeek: 1,
  startTime: '09:00',
  endTime: '18:00',
  isActive: true,
};

const createServiceMock = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  getSchedules: jest.fn(),
  upsertSchedules: jest.fn(),
});

// ── Test suite ────────────────────────────────────────────────────────────────

describe('ArtistsController', () => {
  let controller: ArtistsController;
  let service: ReturnType<typeof createServiceMock>;

  beforeEach(async () => {
    service = createServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArtistsController],
      providers: [
        { provide: ArtistsService, useValue: service },
      ],
    }).compile();

    controller = module.get<ArtistsController>(ArtistsController);
  });

  // ── create ────────────────────────────────────────────────────────────────

  describe('POST /artists', () => {
    it('creates an artist scoped to the current studio', async () => {
      const dto = {
        firstName: 'Carlos',
        lastName: 'Tattoo',
        styles: ['blackwork'],
      };
      service.create.mockResolvedValue(mockArtist);

      const result = await controller.create(dto, mockUser);

      expect(result).toEqual(mockArtist);
      expect(service.create).toHaveBeenCalledWith(dto, 'studio-1');
    });

    it('creates an artist with schedules', async () => {
      const dto = {
        firstName: 'Carlos',
        lastName: 'Tattoo',
        schedules: [{ dayOfWeek: 1, startTime: '09:00', endTime: '18:00' }],
      };
      const expected = { ...mockArtist, schedules: [mockSchedule] };
      service.create.mockResolvedValue(expected);

      const result = await controller.create(dto, mockUser);

      expect(result).toEqual(expected);
      expect(service.create).toHaveBeenCalledWith(dto, 'studio-1');
    });
  });

  // ── findAll ────────────────────────────────────────────────────────────────

  describe('GET /artists', () => {
    it('returns all artists for the current studio', async () => {
      service.findAll.mockResolvedValue([mockArtist]);

      const result = await controller.findAll(mockUser);

      expect(result).toEqual([mockArtist]);
      expect(service.findAll).toHaveBeenCalledWith('studio-1');
    });

    it('returns empty array when no artists exist', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll(mockUser);

      expect(result).toEqual([]);
    });
  });

  // ── findById ──────────────────────────────────────────────────────────────

  describe('GET /artists/:id', () => {
    it('returns the artist by id', async () => {
      service.findById.mockResolvedValue(mockArtist);

      const result = await controller.findById('artist-1', mockUser);

      expect(result).toEqual(mockArtist);
      expect(service.findById).toHaveBeenCalledWith('artist-1', 'studio-1');
    });
  });

  // ── update ────────────────────────────────────────────────────────────────

  describe('PATCH /artists/:id', () => {
    it('updates and returns the artist', async () => {
      const dto = { firstName: 'Carlos Updated' };
      const updated = { ...mockArtist, firstName: 'Carlos Updated' };
      service.update.mockResolvedValue(updated);

      const result = await controller.update('artist-1', dto, mockUser);

      expect(result.firstName).toBe('Carlos Updated');
      expect(service.update).toHaveBeenCalledWith('artist-1', dto, 'studio-1');
    });
  });

  // ── remove ────────────────────────────────────────────────────────────────

  describe('DELETE /artists/:id', () => {
    it('removes the artist (returns void)', async () => {
      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove('artist-1', mockUser);

      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith('artist-1', 'studio-1');
    });
  });

  // ── getSchedules ──────────────────────────────────────────────────────────

  describe('GET /artists/:id/schedules', () => {
    it('returns schedules for the artist', async () => {
      service.getSchedules.mockResolvedValue([mockSchedule]);

      const result = await controller.getSchedules('artist-1', mockUser);

      expect(result).toEqual([mockSchedule]);
      expect(service.getSchedules).toHaveBeenCalledWith('artist-1', 'studio-1');
    });
  });

  // ── upsertSchedules ───────────────────────────────────────────────────────

  describe('PUT /artists/:id/schedules', () => {
    it('upserts schedules for the artist', async () => {
      const schedules = [
        { dayOfWeek: 1, startTime: '10:00', endTime: '19:00', isActive: true },
        { dayOfWeek: 3, startTime: '10:00', endTime: '19:00', isActive: true },
      ];
      const expected = schedules.map((s, i) => ({ ...s, id: `sched-${i}`, artistId: 'artist-1' }));
      service.upsertSchedules.mockResolvedValue(expected);

      const result = await controller.upsertSchedules('artist-1', schedules, mockUser);

      expect(result).toEqual(expected);
      expect(service.upsertSchedules).toHaveBeenCalledWith('artist-1', schedules, 'studio-1');
    });
  });
});

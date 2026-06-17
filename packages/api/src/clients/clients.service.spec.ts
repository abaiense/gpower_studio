import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { PrismaService } from '../prisma/prisma.service';

// ── Helpers ──────────────────────────────────────────────────────────────────

const mockClient = {
  id: 'client-1',
  firstName: 'João',
  lastName: 'Silva',
  email: 'joao@email.com',
  phone: '11999999999',
  birthDate: new Date('1995-06-15'),
  notes: null,
  allergies: null,
  isBlocked: false,
  blockReason: null,
  studioId: 'studio-1',
  noShowCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ── Mock factory ──────────────────────────────────────────────────────────────

const createPrismaMock = () => ({
  client: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
});

// ── Test suite ────────────────────────────────────────────────────────────────

describe('ClientsService', () => {
  let service: ClientsService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
  });

  // ── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('creates a client with required fields', async () => {
      const dto = {
        firstName: 'João',
        lastName: 'Silva',
        phone: '11999999999',
      };
      prisma.client.create.mockResolvedValue(mockClient);

      const result = await service.create(dto, 'studio-1');

      expect(result).toEqual(mockClient);
      expect(prisma.client.create).toHaveBeenCalledWith({
        data: { ...dto, studioId: 'studio-1' },
      });
    });

    it('creates a client with all optional fields', async () => {
      const dto = {
        firstName: 'Maria',
        lastName: 'Santos',
        email: 'maria@email.com',
        phone: '11888888888',
        birthDate: '1990-01-10',
        notes: 'Prefere contato por WhatsApp',
        allergies: 'Látex',
      };
      const expected = {
        ...mockClient,
        ...dto,
        birthDate: new Date(dto.birthDate),
      };
      prisma.client.create.mockResolvedValue(expected);

      const result = await service.create(dto, 'studio-1');

      expect(result).toEqual(expected);
      expect(prisma.client.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          birthDate: new Date('1990-01-10'),
          studioId: 'studio-1',
        },
      });
    });
  });

  // ── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns all clients for the studio', async () => {
      prisma.client.findMany.mockResolvedValue([mockClient]);

      const result = await service.findAll('studio-1');

      expect(result).toEqual([mockClient]);
      expect(prisma.client.findMany).toHaveBeenCalledWith({
        where: { studioId: 'studio-1' },
        orderBy: { firstName: 'asc' },
      });
    });

    it('returns empty array when studio has no clients', async () => {
      prisma.client.findMany.mockResolvedValue([]);

      const result = await service.findAll('studio-1');

      expect(result).toEqual([]);
    });
  });

  // ── findById ──────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('returns the client when found in the studio', async () => {
      prisma.client.findFirst.mockResolvedValue(mockClient);

      const result = await service.findById('client-1', 'studio-1');

      expect(result).toEqual(mockClient);
      expect(prisma.client.findFirst).toHaveBeenCalledWith({
        where: { id: 'client-1', studioId: 'studio-1' },
      });
    });

    it('throws NotFoundException when client does not exist', async () => {
      prisma.client.findFirst.mockResolvedValue(null);

      await expect(
        service.findById('nonexistent', 'studio-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── findByPhone ───────────────────────────────────────────────────────────

  describe('findByPhone', () => {
    it('returns the client when phone matches', async () => {
      prisma.client.findFirst.mockResolvedValue(mockClient);

      const result = await service.findByPhone('11999999999', 'studio-1');

      expect(result).toEqual(mockClient);
      expect(prisma.client.findFirst).toHaveBeenCalledWith({
        where: { phone: '11999999999', studioId: 'studio-1' },
      });
    });

    it('returns null when phone does not match', async () => {
      prisma.client.findFirst.mockResolvedValue(null);

      const result = await service.findByPhone('00000000000', 'studio-1');

      expect(result).toBeNull();
    });

    it('is scoped to the studio', async () => {
      prisma.client.findFirst.mockResolvedValue(null);

      await service.findByPhone('11999999999', 'studio-2');

      expect(prisma.client.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { phone: '11999999999', studioId: 'studio-2' } }),
      );
    });
  });

  // ── update ────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('updates and returns the client', async () => {
      prisma.client.findFirst.mockResolvedValue(mockClient);
      const updateDto = { firstName: 'João Updated' };
      const updated = { ...mockClient, firstName: 'João Updated' };
      prisma.client.update.mockResolvedValue(updated);

      const result = await service.update('client-1', updateDto, 'studio-1');

      expect(result.firstName).toBe('João Updated');
      expect(prisma.client.update).toHaveBeenCalledWith({
        where: { id: 'client-1' },
        data: updateDto,
      });
    });

    it('coerces birthDate string to Date on update', async () => {
      prisma.client.findFirst.mockResolvedValue(mockClient);
      prisma.client.update.mockResolvedValue(mockClient);

      await service.update('client-1', { birthDate: '2000-01-01' }, 'studio-1');

      expect(prisma.client.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            birthDate: new Date('2000-01-01'),
          }),
        }),
      );
    });

    it('sets birthDate to null when empty string provided', async () => {
      prisma.client.findFirst.mockResolvedValue(mockClient);
      prisma.client.update.mockResolvedValue({ ...mockClient, birthDate: null });

      await service.update('client-1', { birthDate: '' }, 'studio-1');

      expect(prisma.client.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            birthDate: null,
          }),
        }),
      );
    });

    it('throws NotFoundException when updating nonexistent client', async () => {
      prisma.client.findFirst.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { firstName: 'X' }, 'studio-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── remove ────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('deletes the client', async () => {
      prisma.client.findFirst.mockResolvedValue(mockClient);
      prisma.client.delete.mockResolvedValue(mockClient);

      await service.remove('client-1', 'studio-1');

      expect(prisma.client.delete).toHaveBeenCalledWith({
        where: { id: 'client-1' },
      });
    });

    it('throws NotFoundException when deleting nonexistent client', async () => {
      prisma.client.findFirst.mockResolvedValue(null);

      await expect(
        service.remove('nonexistent', 'studio-1'),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.client.delete).not.toHaveBeenCalled();
    });
  });
});

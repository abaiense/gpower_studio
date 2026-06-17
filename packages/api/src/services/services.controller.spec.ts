import { Test, TestingModule } from '@nestjs/testing';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockUser = {
  sub: 'user-1',
  email: 'owner@studio.com',
  role: 'OWNER',
  studioId: 'studio-1',
};

const mockService = {
  id: 'service-1',
  name: 'Tatuagem Preta',
  description: 'Tatuagem em preto e cinza',
  category: 'TATTOO',
  durationMin: 120,
  basePrice: 500,
  isActive: true,
  studioId: 'studio-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const createServiceMock = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

// ── Test suite ────────────────────────────────────────────────────────────────

describe('ServicesController', () => {
  let controller: ServicesController;
  let service: ReturnType<typeof createServiceMock>;

  beforeEach(async () => {
    service = createServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicesController],
      providers: [
        { provide: ServicesService, useValue: service },
      ],
    }).compile();

    controller = module.get<ServicesController>(ServicesController);
  });

  describe('POST /services', () => {
    it('creates a service scoped to the current studio', async () => {
      const dto = {
        name: 'Tatuagem Preta',
        category: 'TATTOO' as const,
        durationMin: 120,
      };
      service.create.mockResolvedValue(mockService);

      const result = await controller.create(dto, mockUser);

      expect(result).toEqual(mockService);
      expect(service.create).toHaveBeenCalledWith(dto, 'studio-1');
    });
  });

  describe('GET /services', () => {
    it('returns all services for the current studio', async () => {
      service.findAll.mockResolvedValue([mockService]);

      const result = await controller.findAll(undefined, mockUser);

      expect(result).toEqual([mockService]);
      expect(service.findAll).toHaveBeenCalledWith('studio-1', undefined);
    });

    it('filters by category when provided', async () => {
      service.findAll.mockResolvedValue([mockService]);

      const result = await controller.findAll('TATTOO' as any, mockUser);

      expect(service.findAll).toHaveBeenCalledWith('studio-1', 'TATTOO');
    });

    it('returns empty array when no services exist', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll(undefined, mockUser);

      expect(result).toEqual([]);
    });
  });

  describe('GET /services/:id', () => {
    it('returns the service by id', async () => {
      service.findById.mockResolvedValue(mockService);

      const result = await controller.findById('service-1', mockUser);

      expect(result).toEqual(mockService);
      expect(service.findById).toHaveBeenCalledWith('service-1', 'studio-1');
    });
  });

  describe('PATCH /services/:id', () => {
    it('updates and returns the service', async () => {
      const dto = { basePrice: 600 };
      const updated = { ...mockService, basePrice: 600 };
      service.update.mockResolvedValue(updated);

      const result = await controller.update('service-1', dto, mockUser);

      expect(result.basePrice).toBe(600);
      expect(service.update).toHaveBeenCalledWith('service-1', dto, 'studio-1');
    });
  });

  describe('DELETE /services/:id', () => {
    it('removes the service (returns void)', async () => {
      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove('service-1', mockUser);

      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith('service-1', 'studio-1');
    });
  });
});

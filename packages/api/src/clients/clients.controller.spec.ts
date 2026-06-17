import { Test, TestingModule } from '@nestjs/testing';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockUser = {
  sub: 'user-1',
  email: 'owner@studio.com',
  role: 'OWNER',
  studioId: 'studio-1',
};

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

const createServiceMock = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  findByPhone: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  generatePhotoUploadUrl: jest.fn(),
});

// ── Test suite ────────────────────────────────────────────────────────────────

describe('ClientsController', () => {
  let controller: ClientsController;
  let service: ReturnType<typeof createServiceMock>;

  beforeEach(async () => {
    service = createServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        { provide: ClientsService, useValue: service },
      ],
    }).compile();

    controller = module.get<ClientsController>(ClientsController);
  });

  describe('POST /clients', () => {
    it('creates a client scoped to the current studio', async () => {
      const dto = {
        firstName: 'João',
        lastName: 'Silva',
        phone: '11999999999',
      };
      service.create.mockResolvedValue(mockClient);

      const result = await controller.create(dto, mockUser);

      expect(result).toEqual(mockClient);
      expect(service.create).toHaveBeenCalledWith(dto, 'studio-1');
    });
  });

  describe('GET /clients', () => {
    it('returns all clients for the current studio', async () => {
      service.findAll.mockResolvedValue([mockClient]);

      const result = await controller.findAll(mockUser, {});

      expect(result).toEqual([mockClient]);
      expect(service.findAll).toHaveBeenCalledWith('studio-1', undefined, undefined);
    });

    it('returns empty array when no clients exist', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll(mockUser, {});

      expect(result).toEqual([]);
    });

    it('passes search query to service', async () => {
      service.findAll.mockResolvedValue([mockClient]);

      const result = await controller.findAll(mockUser, { search: 'john' });

      expect(result).toEqual([mockClient]);
      expect(service.findAll).toHaveBeenCalledWith('studio-1', 'john', undefined);
    });

    it('passes isBlocked filter to service', async () => {
      service.findAll.mockResolvedValue([]);

      await controller.findAll(mockUser, { isBlocked: true });

      expect(service.findAll).toHaveBeenCalledWith('studio-1', undefined, true);
    });

    it('passes both search and isBlocked to service', async () => {
      service.findAll.mockResolvedValue([mockClient]);

      await controller.findAll(mockUser, { search: 'silva', isBlocked: false });

      expect(service.findAll).toHaveBeenCalledWith('studio-1', 'silva', false);
    });
  });

  describe('GET /clients/search/phone', () => {
    it('returns client by phone number', async () => {
      service.findByPhone.mockResolvedValue(mockClient);

      const result = await controller.findByPhone('11999999999', mockUser);

      expect(result).toEqual(mockClient);
      expect(service.findByPhone).toHaveBeenCalledWith('11999999999', 'studio-1');
    });

    it('returns null when phone does not match', async () => {
      service.findByPhone.mockResolvedValue(null);

      const result = await controller.findByPhone('00000000000', mockUser);

      expect(result).toBeNull();
    });
  });

  describe('GET /clients/:id', () => {
    it('returns the client by id', async () => {
      service.findById.mockResolvedValue(mockClient);

      const result = await controller.findById('client-1', mockUser);

      expect(result).toEqual(mockClient);
      expect(service.findById).toHaveBeenCalledWith('client-1', 'studio-1');
    });
  });

  describe('PATCH /clients/:id', () => {
    it('updates and returns the client', async () => {
      const dto = { firstName: 'João Updated' };
      const updated = { ...mockClient, firstName: 'João Updated' };
      service.update.mockResolvedValue(updated);

      const result = await controller.update('client-1', dto, mockUser);

      expect(result.firstName).toBe('João Updated');
      expect(service.update).toHaveBeenCalledWith('client-1', dto, 'studio-1');
    });
  });

  describe('DELETE /clients/:id', () => {
    it('removes the client (returns void)', async () => {
      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove('client-1', mockUser);

      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith('client-1', 'studio-1');
    });
  });

  describe('POST /clients/:id/photo-upload-url', () => {
    it('returns uploadUrl and photoUrl', async () => {
      const mockResponse = {
        uploadUrl: 'https://signed-url.example.com/upload',
        photoUrl: 'https://bucket.s3.amazonaws.com/studios/studio-1/clients/client-1/photos/123-photo.jpg',
      };
      service.generatePhotoUploadUrl.mockResolvedValue(mockResponse);

      const dto = { fileName: 'photo.jpg', contentType: 'image/jpeg' };
      const result = await controller.generatePhotoUploadUrl('client-1', dto, mockUser);

      expect(result).toEqual(mockResponse);
      expect(service.generatePhotoUploadUrl).toHaveBeenCalledWith(
        'client-1',
        'studio-1',
        'photo.jpg',
        'image/jpeg',
      );
    });

    it('passes studioId from current user', async () => {
      service.generatePhotoUploadUrl.mockResolvedValue({
        uploadUrl: 'https://upload.example.com',
        photoUrl: 'https://cdn.example.com/key',
      });

      await controller.generatePhotoUploadUrl(
        'client-2',
        { fileName: 'tattoo.png', contentType: 'image/png' },
        mockUser,
      );

      expect(service.generatePhotoUploadUrl).toHaveBeenCalledWith(
        'client-2',
        'studio-1',
        'tattoo.png',
        'image/png',
      );
    });
  });
});

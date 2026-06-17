import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ArtFilesService } from './art-files.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://s3.example.com/signed-url'),
}));
jest.mock('jsonwebtoken', () => ({ sign: jest.fn().mockReturnValue('mock-token') }));

const mockArtFile = {
  id: 'art-1',
  version: 1,
  filename: 'design.jpg',
  s3Key: 'studios/s1/art/p1/v1-design.jpg',
  mimeType: 'image/jpeg',
  sizeBytes: 102400,
  status: 'DRAFT' as const,
  notes: null,
  clientNotes: null,
  approvalToken: null,
  approvalTokenExpiresAt: null,
  approvedAt: null,
  approvedIp: null,
  projectId: 'proj-1',
  studioId: 'studio-1',
  uploadedBy: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const createPrismaMock = () => ({
  project: { findFirst: jest.fn() },
  artFile: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    aggregate: jest.fn(),
  },
});

describe('ArtFilesService', () => {
  let service: ArtFilesService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArtFilesService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(ArtFilesService);
  });

  describe('initUpload', () => {
    it('throws NotFoundException when project not found', async () => {
      prisma.project.findFirst.mockResolvedValue(null);
      await expect(
        service.initUpload(
          'bad-proj',
          { filename: 'x.jpg', mimeType: 'image/jpeg', sizeBytes: 100 },
          'studio-1',
          'user-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('returns uploadUrl and artFileId on success', async () => {
      prisma.project.findFirst.mockResolvedValue({ id: 'proj-1', studioId: 'studio-1' });
      prisma.artFile.aggregate.mockResolvedValue({ _max: { version: 0 } });
      prisma.artFile.create.mockResolvedValue(mockArtFile);
      const result = await service.initUpload(
        'proj-1',
        { filename: 'design.jpg', mimeType: 'image/jpeg', sizeBytes: 102400 },
        'studio-1',
        'user-1',
      );
      expect(result.uploadUrl).toContain('https://s3.example.com');
      expect(result.artFileId).toBe('art-1');
    });

    it('increments version from last version', async () => {
      prisma.project.findFirst.mockResolvedValue({ id: 'proj-1', studioId: 'studio-1' });
      prisma.artFile.aggregate.mockResolvedValue({ _max: { version: 3 } });
      prisma.artFile.create.mockResolvedValue({ ...mockArtFile, version: 4 });
      await service.initUpload(
        'proj-1',
        { filename: 'v4.jpg', mimeType: 'image/jpeg', sizeBytes: 100 },
        'studio-1',
        'user-1',
      );
      expect(prisma.artFile.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ version: 4 }) }),
      );
    });
  });

  describe('confirmUpload', () => {
    it('throws NotFoundException when art file not found', async () => {
      prisma.artFile.findFirst.mockResolvedValue(null);
      await expect(service.confirmUpload('proj-1', 'bad-id', 'studio-1')).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when not DRAFT', async () => {
      prisma.artFile.findFirst.mockResolvedValue({ ...mockArtFile, status: 'SENT' });
      await expect(service.confirmUpload('proj-1', 'art-1', 'studio-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('returns art files ordered by version ascending', async () => {
      prisma.artFile.findMany.mockResolvedValue([mockArtFile]);
      const result = await service.findAll('proj-1', 'studio-1');
      expect(prisma.artFile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { version: 'asc' } }),
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('getDownloadUrl', () => {
    it('throws NotFoundException when art file not found', async () => {
      prisma.artFile.findFirst.mockResolvedValue(null);
      await expect(service.getDownloadUrl('proj-1', 'bad-id', 'studio-1')).rejects.toThrow(NotFoundException);
    });

    it('returns signed S3 URL', async () => {
      prisma.artFile.findFirst.mockResolvedValue(mockArtFile);
      const result = await service.getDownloadUrl('proj-1', 'art-1', 'studio-1');
      expect(result.url).toBe('https://s3.example.com/signed-url');
    });
  });

  describe('sendForApproval', () => {
    it('throws NotFoundException when art file not found', async () => {
      prisma.artFile.findFirst.mockResolvedValue(null);
      await expect(service.sendForApproval('proj-1', 'bad-id', {}, 'studio-1')).rejects.toThrow(NotFoundException);
    });

    it('sets status to SENT and returns token + approvalUrl', async () => {
      prisma.artFile.findFirst.mockResolvedValue(mockArtFile);
      prisma.artFile.update.mockResolvedValue({ ...mockArtFile, status: 'SENT', approvalToken: 'mock-token' });
      prisma.project.findFirst.mockResolvedValue({
        id: 'proj-1',
        name: 'Sleeve Dragon',
        client: { firstName: 'Ana', lastName: 'Lima', phone: '+5511999' },
        artist: { firstName: 'João', lastName: 'Silva' },
        studio: { id: 'studio-1', name: 'GPower' },
      });
      const result = await service.sendForApproval('proj-1', 'art-1', {}, 'studio-1');
      expect(result.token).toBe('mock-token');
      expect(result.approvalUrl).toContain('/approve/mock-token');
      expect(prisma.artFile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'SENT' }),
        }),
      );
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../prisma/prisma.service';

const mockProject = {
  id: 'proj-1', name: 'Sleeve Dragon', description: null,
  estimatedSessions: 3, status: 'ACTIVE' as const,
  depositAmount: null, depositPaid: false,
  clientId: 'client-1', artistId: 'artist-1', studioId: 'studio-1',
  createdAt: new Date(), updatedAt: new Date(),
  client: { id: 'client-1', firstName: 'Ana', lastName: 'Lima', phone: '+5511999' },
  artist: { id: 'artist-1', firstName: 'João', lastName: 'Silva' },
  appointments: [],
  artFiles: [],
};

const createPrismaMock = () => ({
  project: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  appointment: { update: jest.fn() },
});

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectsService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(ProjectsService);
  });

  describe('create', () => {
    it('creates project with studioId', async () => {
      prisma.project.create.mockResolvedValue(mockProject);
      const result = await service.create(
        { name: 'Sleeve Dragon', clientId: 'client-1', artistId: 'artist-1' },
        'studio-1',
      );
      expect(prisma.project.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ studioId: 'studio-1' }) }),
      );
      expect(result.name).toBe('Sleeve Dragon');
    });

    it('defaults estimatedSessions to 1', async () => {
      prisma.project.create.mockResolvedValue({ ...mockProject, estimatedSessions: 1 });
      await service.create({ name: 'Test', clientId: 'c1', artistId: 'a1' }, 'studio-1');
      expect(prisma.project.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ estimatedSessions: 1 }) }),
      );
    });
  });

  describe('findOne', () => {
    it('returns project when found', async () => {
      prisma.project.findFirst.mockResolvedValue(mockProject);
      const result = await service.findOne('proj-1', 'studio-1');
      expect(result.id).toBe('proj-1');
    });

    it('throws NotFoundException when not found', async () => {
      prisma.project.findFirst.mockResolvedValue(null);
      await expect(service.findOne('bad-id', 'studio-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('close', () => {
    it('throws BadRequestException when open appointments exist', async () => {
      prisma.project.findFirst.mockResolvedValue({
        ...mockProject,
        appointments: [{ id: 'a1', status: 'CONFIRMED' }],
      });
      await expect(service.close('proj-1', 'studio-1')).rejects.toThrow(BadRequestException);
    });

    it('closes project when all sessions done', async () => {
      prisma.project.findFirst.mockResolvedValue({
        ...mockProject,
        appointments: [{ id: 'a1', status: 'COMPLETED' }],
      });
      prisma.project.update.mockResolvedValue({ ...mockProject, status: 'COMPLETED' });
      const result = await service.close('proj-1', 'studio-1');
      expect(result.status).toBe('COMPLETED');
    });

    it('allows closing project with only CANCELLED/NO_SHOW appointments', async () => {
      prisma.project.findFirst.mockResolvedValue({
        ...mockProject,
        appointments: [
          { id: 'a1', status: 'CANCELLED' },
          { id: 'a2', status: 'NO_SHOW' },
        ],
      });
      prisma.project.update.mockResolvedValue({ ...mockProject, status: 'COMPLETED' });
      const result = await service.close('proj-1', 'studio-1');
      expect(result.status).toBe('COMPLETED');
    });

    it('throws NotFoundException when project not found', async () => {
      prisma.project.findFirst.mockResolvedValue(null);
      await expect(service.close('bad-id', 'studio-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('linkAppointment', () => {
    it('links appointment to project', async () => {
      prisma.project.findFirst.mockResolvedValue(mockProject);
      prisma.appointment.update.mockResolvedValue({ id: 'appt-1', projectId: 'proj-1' });
      await service.linkAppointment('proj-1', 'appt-1', 'studio-1');
      expect(prisma.appointment.update).toHaveBeenCalledWith({
        where: { id: 'appt-1' },
        data: { projectId: 'proj-1' },
      });
    });
  });
});

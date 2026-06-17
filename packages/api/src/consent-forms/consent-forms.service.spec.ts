import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ConsentFormsService } from './consent-forms.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

jest.mock('jsonwebtoken', () => ({ sign: jest.fn().mockReturnValue('mock-consent-token') }));

const mockForm = {
  id: 'cf-1',
  formType: 'TATTOO_ADULT',
  data: { title: 'Termo de Consentimento — Tatuagem', clauses: 'Declaro...' },
  signatureUrl: null,
  signedAt: null,
  signerIp: null,
  signerDevice: null,
  clientId: 'client-1',
  appointmentId: null,
  studioId: 'studio-1',
  consentToken: null,
  consentTokenExpiresAt: null,
  projectId: null,
  createdAt: new Date(),
};

const mockClient = {
  id: 'client-1',
  firstName: 'Ana',
  lastName: 'Lima',
  phone: '+5511999887766',
  email: 'ana@example.com',
};

const mockNotificationsService = {
  send: jest.fn().mockResolvedValue(undefined),
};

const createPrismaMock = () => ({
  consentForm: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  client: { findFirst: jest.fn() },
});

describe('ConsentFormsService', () => {
  let service: ConsentFormsService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();
    mockNotificationsService.send.mockClear();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsentFormsService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();
    service = module.get(ConsentFormsService);
  });

  describe('create', () => {
    it('creates form with template data and studioId', async () => {
      prisma.consentForm.create.mockResolvedValue(mockForm);
      await service.create({ formType: 'TATTOO_ADULT', clientId: 'client-1' }, 'studio-1');
      expect(prisma.consentForm.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            studioId: 'studio-1',
            formType: 'TATTOO_ADULT',
            data: expect.objectContaining({ title: 'Termo de Consentimento — Tatuagem' }),
          }),
        }),
      );
    });

    it('falls back to TATTOO_ADULT template for unknown formType', async () => {
      prisma.consentForm.create.mockResolvedValue(mockForm);
      await service.create({ formType: 'UNKNOWN_TYPE', clientId: 'client-1' }, 'studio-1');
      expect(prisma.consentForm.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            data: expect.objectContaining({ title: 'Termo de Consentimento — Tatuagem' }),
          }),
        }),
      );
    });

    it('includes appointmentId when provided', async () => {
      prisma.consentForm.create.mockResolvedValue(mockForm);
      await service.create(
        { formType: 'TATTOO_ADULT', clientId: 'client-1', appointmentId: 'appt-1' },
        'studio-1',
      );
      expect(prisma.consentForm.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ appointmentId: 'appt-1' }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('returns form when found', async () => {
      prisma.consentForm.findFirst.mockResolvedValue(mockForm);
      const result = await service.findOne('cf-1', 'studio-1');
      expect(result.id).toBe('cf-1');
    });

    it('throws NotFoundException when not found', async () => {
      prisma.consentForm.findFirst.mockResolvedValue(null);
      await expect(service.findOne('bad-id', 'studio-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('filters by SIGNED status', async () => {
      prisma.consentForm.findMany.mockResolvedValue([mockForm]);
      await service.findAll('studio-1', { status: 'SIGNED' });
      expect(prisma.consentForm.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ signedAt: { not: null } }),
        }),
      );
    });

    it('filters by PENDING status', async () => {
      prisma.consentForm.findMany.mockResolvedValue([]);
      await service.findAll('studio-1', { status: 'PENDING' });
      expect(prisma.consentForm.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ signedAt: null }),
        }),
      );
    });
  });

  describe('send', () => {
    it('generates token, updates form, and sends WhatsApp notification', async () => {
      prisma.consentForm.findFirst.mockResolvedValue(mockForm);
      prisma.consentForm.update.mockResolvedValue({
        ...mockForm,
        consentToken: 'mock-consent-token',
      });
      prisma.client.findFirst.mockResolvedValue(mockClient);

      const result = await service.send('cf-1', 'studio-1');

      expect(result.token).toBe('mock-consent-token');
      expect(result.consentUrl).toContain('/consent/mock-consent-token');
      expect(prisma.consentForm.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            consentToken: 'mock-consent-token',
            consentTokenExpiresAt: expect.any(Date),
          }),
        }),
      );
      expect(mockNotificationsService.send).toHaveBeenCalledWith(
        expect.objectContaining({
          template: 'CONSENT_REQUEST',
          channel: 'whatsapp',
        }),
      );
    });

    it('throws NotFoundException when form not found', async () => {
      prisma.consentForm.findFirst.mockResolvedValue(null);
      await expect(service.send('bad-id', 'studio-1')).rejects.toThrow(NotFoundException);
    });
  });
});

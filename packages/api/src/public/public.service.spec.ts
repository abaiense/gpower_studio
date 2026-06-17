import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PublicService } from './public.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://s3.example.com/view-url'),
}));

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn().mockReturnValue({
    artFileId: 'art-1',
    projectId: 'proj-1',
    studioId: 'studio-1',
    consentFormId: 'cf-1',
  }),
  sign: jest.fn().mockReturnValue('mock-token'),
}));

const mockArtFile = {
  id: 'art-1',
  version: 1,
  filename: 'design.jpg',
  s3Key: 'studios/s1/art/v1.jpg',
  mimeType: 'image/jpeg',
  sizeBytes: 100,
  status: 'SENT' as const,
  notes: null,
  clientNotes: null,
  approvalToken: 'mock-token',
  approvalTokenExpiresAt: null,
  approvedAt: null,
  approvedIp: null,
  projectId: 'proj-1',
  studioId: 'studio-1',
  uploadedBy: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  project: { name: 'Sleeve Dragon' },
};

const mockConsentForm = {
  id: 'cf-1',
  formType: 'TATTOO_ADULT',
  data: { title: 'Termo', clauses: 'Declaro...' },
  signatureUrl: null,
  signedAt: null,
  signerIp: null,
  signerDevice: null,
  clientId: 'client-1',
  appointmentId: null,
  studioId: 'studio-1',
  consentToken: 'mock-token',
  consentTokenExpiresAt: null,
  projectId: null,
  createdAt: new Date(),
  client: { firstName: 'Ana', lastName: 'Lima' },
};

const createPrismaMock = () => ({
  artFile: { findFirst: jest.fn(), update: jest.fn() },
  consentForm: { findFirst: jest.fn(), update: jest.fn() },
});

describe('PublicService', () => {
  let service: PublicService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [PublicService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(PublicService);
  });

  describe('getArtForApproval', () => {
    it('returns art file with signed view URL', async () => {
      prisma.artFile.findFirst.mockResolvedValue(mockArtFile);
      const result = await service.getArtForApproval('mock-token');
      expect(result.viewUrl).toBe('https://s3.example.com/view-url');
      expect(result.artFile.id).toBe('art-1');
    });

    it('strips approvalToken from returned artFile', async () => {
      prisma.artFile.findFirst.mockResolvedValue(mockArtFile);
      const result = await service.getArtForApproval('mock-token');
      expect(result.artFile).not.toHaveProperty('approvalToken');
    });

    it('throws NotFoundException when art file not found', async () => {
      prisma.artFile.findFirst.mockResolvedValue(null);
      await expect(service.getArtForApproval('mock-token')).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException on invalid token', async () => {
      const jwt = require('jsonwebtoken');
      jwt.verify.mockImplementationOnce(() => { throw new Error('invalid'); });
      await expect(service.getArtForApproval('bad-token')).rejects.toThrow(BadRequestException);
    });
  });

  describe('approveArt', () => {
    it('sets status APPROVED and records IP', async () => {
      prisma.artFile.findFirst.mockResolvedValue(mockArtFile);
      prisma.artFile.update.mockResolvedValue({ ...mockArtFile, status: 'APPROVED', approvedIp: '1.2.3.4' });
      const result = await service.approveArt('mock-token', '1.2.3.4');
      expect(prisma.artFile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'APPROVED',
            approvedIp: '1.2.3.4',
            approvedAt: expect.any(Date),
          }),
        }),
      );
      expect(result.message).toBe('Arte aprovada com sucesso!');
    });

    it('returns idempotent message when already approved', async () => {
      prisma.artFile.findFirst.mockResolvedValue({ ...mockArtFile, status: 'APPROVED' });
      const result = await service.approveArt('mock-token', '1.2.3.4');
      expect(result.message).toBe('Already approved');
      expect(prisma.artFile.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when art file not found', async () => {
      prisma.artFile.findFirst.mockResolvedValue(null);
      await expect(service.approveArt('mock-token', '1.2.3.4')).rejects.toThrow(NotFoundException);
    });
  });

  describe('requestRevision', () => {
    it('sets status REVISION_REQUESTED and saves clientNotes', async () => {
      prisma.artFile.findFirst.mockResolvedValue(mockArtFile);
      prisma.artFile.update.mockResolvedValue({ ...mockArtFile, status: 'REVISION_REQUESTED' });
      const result = await service.requestRevision('mock-token', 'Mudar a cor');
      expect(prisma.artFile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'REVISION_REQUESTED',
            clientNotes: 'Mudar a cor',
          }),
        }),
      );
      expect(result.message).toBe('Solicitação de revisão enviada!');
    });

    it('throws NotFoundException when art file not found', async () => {
      prisma.artFile.findFirst.mockResolvedValue(null);
      await expect(service.requestRevision('mock-token', 'notes')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getConsentForm', () => {
    it('returns consent form with client info', async () => {
      prisma.consentForm.findFirst.mockResolvedValue(mockConsentForm);
      const result = await service.getConsentForm('mock-token');
      expect(result.id).toBe('cf-1');
      expect(result.client).toEqual({ firstName: 'Ana', lastName: 'Lima' });
    });

    it('throws NotFoundException when form not found', async () => {
      prisma.consentForm.findFirst.mockResolvedValue(null);
      await expect(service.getConsentForm('mock-token')).rejects.toThrow(NotFoundException);
    });
  });

  describe('signConsent', () => {
    it('records SHA-256 hash, IP, userAgent and signedAt', async () => {
      prisma.consentForm.findFirst.mockResolvedValue(mockConsentForm);
      prisma.consentForm.update.mockResolvedValue({ ...mockConsentForm, signedAt: new Date() });
      const result = await service.signConsent('mock-token', '1.2.3.4', 'Mozilla/5.0');
      expect(result.hash).toBeDefined();
      expect(typeof result.hash).toBe('string');
      expect(result.hash).toHaveLength(64); // SHA-256 hex
      expect(result.message).toBe('Consentimento registrado com sucesso!');
      expect(prisma.consentForm.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            signedAt: expect.any(Date),
            signerIp: '1.2.3.4',
            signerDevice: 'Mozilla/5.0',
            signatureUrl: expect.any(String),
          }),
        }),
      );
    });

    it('returns idempotent message when already signed', async () => {
      prisma.consentForm.findFirst.mockResolvedValue({ ...mockConsentForm, signedAt: new Date() });
      const result = await service.signConsent('mock-token', '1.2.3.4', 'Mozilla/5.0');
      expect(result.message).toBe('Already signed');
      expect(prisma.consentForm.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when form not found', async () => {
      prisma.consentForm.findFirst.mockResolvedValue(null);
      await expect(service.signConsent('mock-token', '1.2.3.4', 'ua')).rejects.toThrow(NotFoundException);
    });
  });
});

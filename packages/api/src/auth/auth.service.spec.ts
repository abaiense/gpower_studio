import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

// ── Helpers ──────────────────────────────────────────────────────────────────

const mockUser = {
  id: 'user-1',
  email: 'owner@studio.com',
  passwordHash: '',
  firstName: 'Ana',
  lastName: 'Silva',
  role: 'OWNER' as const,
  studioId: 'studio-1',
  isActive: true,
  artistId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockStudio = {
  id: 'studio-1',
  name: 'My Studio',
  slug: 'my-studio',
  email: 'owner@studio.com',
  phone: null,
  address: null,
  city: null,
  state: null,
  logoUrl: null,
  timezone: 'America/Sao_Paulo',
  currency: 'BRL',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRefreshToken = {
  id: 'rt-1',
  token: 'mock-refresh-token',
  userId: 'user-1',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  createdAt: new Date(),
  user: mockUser,
};

// ── Mock factories ────────────────────────────────────────────────────────────

const createPrismaMock = () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  studio: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    deleteMany: jest.fn(),
  },
  $transaction: jest.fn(),
});

const createJwtMock = () => ({
  sign: jest.fn().mockReturnValue('mock-token'),
  verify: jest.fn(),
});

const createConfigMock = () => ({
  get: jest.fn((key: string) => {
    const map: Record<string, string> = {
      JWT_SECRET: 'test-secret',
      JWT_REFRESH_SECRET: 'test-refresh-secret',
    };
    return map[key];
  }),
});

// ── Test suite ────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService;
  let prisma: ReturnType<typeof createPrismaMock>;
  let jwtService: ReturnType<typeof createJwtMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();
    jwtService = createJwtMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: createConfigMock() },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // ── register ──────────────────────────────────────────────────────────────

  describe('register', () => {
    it('creates studio and user owner, returns tokens', async () => {
      prisma.user.findUnique.mockResolvedValue(null); // email not taken
      prisma.studio.findUnique.mockResolvedValue(null); // slug not taken

      const createdUser = { ...mockUser, passwordHash: await bcrypt.hash('password123', 12) };
      prisma.$transaction.mockImplementation(async (cb: (tx: typeof prisma) => Promise<unknown>) => {
        const txMock = {
          studio: { create: jest.fn().mockResolvedValue(mockStudio) },
          user: { create: jest.fn().mockResolvedValue(createdUser) },
        };
        return cb(txMock as unknown as typeof prisma);
      });

      prisma.refreshToken.create.mockResolvedValue(mockRefreshToken);

      const result = await service.register({
        studioName: 'My Studio',
        firstName: 'Ana',
        lastName: 'Silva',
        email: 'owner@studio.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('owner@studio.com');
      expect(result.user.role).toBe('OWNER');
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it('throws ConflictException when email is already in use', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.register({
          studioName: 'My Studio',
          firstName: 'Ana',
          lastName: 'Silva',
          email: 'owner@studio.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ── login ─────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('returns tokens for valid credentials', async () => {
      const hash = await bcrypt.hash('correct-password', 12);
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, passwordHash: hash });
      prisma.refreshToken.create.mockResolvedValue(mockRefreshToken);

      const result = await service.login('owner@studio.com', 'correct-password');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('owner@studio.com');
    });

    it('throws UnauthorizedException for invalid credentials', async () => {
      const hash = await bcrypt.hash('correct-password', 12);
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, passwordHash: hash });

      await expect(
        service.login('owner@studio.com', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login('nobody@studio.com', 'any-password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ── refreshToken ──────────────────────────────────────────────────────────

  describe('refreshToken', () => {
    const validPayload = {
      sub: 'user-1',
      email: 'owner@studio.com',
      role: 'OWNER',
      studioId: 'studio-1',
    };

    it('returns new accessToken for a valid refresh token', async () => {
      jwtService.verify.mockReturnValue(validPayload);
      prisma.refreshToken.findUnique.mockResolvedValue(mockRefreshToken);
      jwtService.sign.mockReturnValue('new-access-token');

      const result = await service.refreshToken('valid-refresh-token');

      expect(result).toHaveProperty('accessToken', 'new-access-token');
      expect(jwtService.verify).toHaveBeenCalledWith('valid-refresh-token', {
        secret: 'test-refresh-secret',
      });
    });

    it('throws UnauthorizedException for an invalid refresh token', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      await expect(service.refreshToken('bad-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when token is not found in DB', async () => {
      jwtService.verify.mockReturnValue(validPayload);
      prisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.refreshToken('orphan-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when token is expired in DB', async () => {
      jwtService.verify.mockReturnValue(validPayload);
      prisma.refreshToken.findUnique.mockResolvedValue({
        ...mockRefreshToken,
        expiresAt: new Date(Date.now() - 1000), // in the past
      });

      await expect(service.refreshToken('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ── logout ────────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('deletes all refresh tokens for the user', async () => {
      prisma.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

      await service.logout('user-1');

      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });
  });
});

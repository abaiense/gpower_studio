import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { createHash } from 'crypto';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

// Mock bcryptjs at the module level to avoid non-configurable property issues
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require('bcryptjs') as { hash: jest.Mock; compare: jest.Mock };

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

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

    // Reset bcrypt mocks to default behaviour before each test
    bcrypt.hash.mockResolvedValue('hashed-password');
    bcrypt.compare.mockResolvedValue(true);

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
      const createdUser = { ...mockUser, passwordHash: 'hashed-password' };
      prisma.$transaction.mockImplementation(async (cb: (tx: typeof prisma) => Promise<unknown>) => {
        const txMock = {
          user: { findUnique: jest.fn().mockResolvedValue(null) }, // email not taken
          studio: {
            findUnique: jest.fn().mockResolvedValue(null), // slug not taken
            create: jest.fn().mockResolvedValue(mockStudio),
          },
          user2: undefined, // placeholder
        };
        // Build a proper tx mock with both user.findUnique and user.create
        const fullTxMock = {
          user: {
            findUnique: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue(createdUser),
          },
          studio: {
            findUnique: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue(mockStudio),
          },
        };
        return cb(fullTxMock as unknown as typeof prisma);
      });

      prisma.refreshToken.deleteMany.mockResolvedValue({ count: 0 });
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
      prisma.$transaction.mockImplementation(async (cb: (tx: typeof prisma) => Promise<unknown>) => {
        const txMock = {
          user: { findUnique: jest.fn().mockResolvedValue(mockUser) },
          studio: { findUnique: jest.fn() },
        };
        return cb(txMock as unknown as typeof prisma);
      });

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

    it('throws ConflictException when studio slug is already taken', async () => {
      prisma.$transaction.mockImplementation(async (cb: (tx: typeof prisma) => Promise<unknown>) => {
        const txMock = {
          user: { findUnique: jest.fn().mockResolvedValue(null) },
          studio: {
            findUnique: jest.fn().mockResolvedValue(mockStudio),
          },
        };
        return cb(txMock as unknown as typeof prisma);
      });

      await expect(
        service.register({
          studioName: 'My Studio',
          firstName: 'Ana',
          lastName: 'Silva',
          email: 'new@studio.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ── login ─────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('returns tokens for valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, passwordHash: 'hashed-password' });
      prisma.refreshToken.deleteMany.mockResolvedValue({ count: 0 });
      prisma.refreshToken.create.mockResolvedValue(mockRefreshToken);

      const result = await service.login('owner@studio.com', 'correct-password');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('owner@studio.com');
    });

    it('throws UnauthorizedException for invalid credentials', async () => {
      bcrypt.compare.mockResolvedValue(false);
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, passwordHash: 'hashed-password' });

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

      const rawToken = 'valid-refresh-token';
      const result = await service.refreshToken(rawToken);

      expect(result).toHaveProperty('accessToken', 'new-access-token');
      expect(jwtService.verify).toHaveBeenCalledWith(rawToken, {
        secret: 'test-refresh-secret',
      });
      // Verify DB lookup used the hashed token
      expect(prisma.refreshToken.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { token: hashToken(rawToken) } }),
      );
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
    it('deletes all refresh tokens for the user when no token is provided', async () => {
      prisma.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

      await service.logout('user-1');

      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });

    it('deletes only the specific session token when refreshToken is provided', async () => {
      prisma.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

      const rawToken = 'specific-refresh-token';
      await service.logout('user-1', rawToken);

      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', token: hashToken(rawToken) },
      });
    });
  });
});

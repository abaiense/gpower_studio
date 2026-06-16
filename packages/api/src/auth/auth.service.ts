import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '@gpower/db';
import * as bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterStudioDto } from './dto/register.dto';
import { JwtPayload, Role } from '@gpower/shared';

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    studioId: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterStudioDto): Promise<AuthTokens> {
    const slug = this.generateSlug(dto.studioName);
    const passwordHash = await bcrypt.hash(dto.password, 12);

    const result = await this.prisma.$transaction(async (tx) => {
      // TOCTOU fix: uniqueness checks inside the transaction
      const existing = await tx.user.findUnique({
        where: { email: dto.email },
      });
      if (existing) {
        throw new ConflictException('Email already in use');
      }

      const existingStudio = await tx.studio.findUnique({
        where: { slug },
      });
      if (existingStudio) {
        throw new ConflictException('Studio slug already taken');
      }

      const studio = await tx.studio.create({
        data: {
          name: dto.studioName,
          slug,
          email: dto.email,
        },
      });

      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: 'OWNER',
          studioId: studio.id,
        },
      });

      return { studio, user };
    });

    return this.generateTokensForUser(result.user);
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateTokensForUser(user);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return null;

    return user;
  }

  async refreshToken(token: string): Promise<{ accessToken: string }> {
    let payload: JwtPayload;
    try {
      const secret = this.getRequiredEnv('JWT_REFRESH_SECRET');
      payload = this.jwtService.verify<JwtPayload>(token, { secret });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const tokenHash = hashToken(token);
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: tokenHash },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt <= new Date()) {
      throw new UnauthorizedException('Refresh token not found or expired');
    }

    const accessToken = this.signAccessToken(payload);
    return { accessToken };
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      // Invalidate only this specific session
      const tokenHash = hashToken(refreshToken);
      await this.prisma.refreshToken.deleteMany({
        where: { userId, token: tokenHash },
      });
    } else {
      // No specific token provided: invalidate all sessions
      await this.prisma.refreshToken.deleteMany({ where: { userId } });
    }
  }

  private async generateTokensForUser(user: User): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role as Role,
      studioId: user.studioId,
    };

    const accessToken = this.signAccessToken(payload);
    const refreshToken = this.signRefreshToken(payload);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Clean up expired tokens before creating a new one (Fix 4)
    await this.prisma.refreshToken.deleteMany({
      where: { userId: user.id, expiresAt: { lte: new Date() } },
    });

    // Store hashed token (Fix 1)
    await this.prisma.refreshToken.create({
      data: {
        token: hashToken(refreshToken),
        userId: user.id,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        studioId: user.studioId,
      },
    };
  }

  private signAccessToken(payload: JwtPayload): string {
    const secret = this.getRequiredEnv('JWT_SECRET');
    return this.jwtService.sign(payload as object, { secret, expiresIn: '15m' });
  }

  private signRefreshToken(payload: JwtPayload): string {
    const secret = this.getRequiredEnv('JWT_REFRESH_SECRET');
    return this.jwtService.sign(payload as object, { secret, expiresIn: '7d' });
  }

  private getRequiredEnv(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) throw new Error(`Missing environment variable: ${key}`);
    return value;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

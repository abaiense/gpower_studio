import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '@gpower/shared';

export interface TenantRequest extends Request {
  studioId?: string;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  use(req: TenantRequest, _res: Response, next: NextFunction): void {
    const authHeader = req.headers['authorization'];
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        const secret = this.configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET environment variable is not set');
        }
        const payload = this.jwtService.verify<JwtPayload>(token, { secret });
        req.studioId = payload.studioId;
      } catch {
        // Token invalid or expired — continue without setting studioId
      }
    }
    next();
  }
}

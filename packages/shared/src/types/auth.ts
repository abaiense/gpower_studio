import { Role } from './enums';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterStudioDto {
  studioName: string;
  studioSlug: string;
  ownerName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JwtPayload {
  sub: string;
  email: string;
  studioId: string;
  role: Role;
  iat?: number;
  exp?: number;
}

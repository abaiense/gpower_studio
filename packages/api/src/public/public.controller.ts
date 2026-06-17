import {
  Controller, Get, Post, Body, Param, Req, HttpCode, HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { IsString } from 'class-validator';
import { PublicService } from './public.service';

class RequestRevisionDto {
  @IsString() clientNotes: string;
}

@Controller('public')
export class PublicController {
  constructor(private readonly service: PublicService) {}

  @Get('art/:token')
  getArtForApproval(@Param('token') token: string) {
    return this.service.getArtForApproval(token);
  }

  @Post('art/:token/approve')
  @HttpCode(HttpStatus.OK)
  approveArt(@Param('token') token: string, @Req() req: Request) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      req.socket.remoteAddress ??
      '';
    return this.service.approveArt(token, ip);
  }

  @Post('art/:token/request-revision')
  @HttpCode(HttpStatus.OK)
  requestRevision(@Param('token') token: string, @Body() dto: RequestRevisionDto) {
    return this.service.requestRevision(token, dto.clientNotes);
  }

  @Get('consent/:token')
  getConsentForm(@Param('token') token: string) {
    return this.service.getConsentForm(token);
  }

  @Post('consent/:token/sign')
  @HttpCode(HttpStatus.OK)
  signConsent(@Param('token') token: string, @Req() req: Request) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      req.socket.remoteAddress ??
      '';
    const ua = req.headers['user-agent'] ?? '';
    return this.service.signConsent(token, ip, ua);
  }
}

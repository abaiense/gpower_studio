import {
  Controller, Get, Post, Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ConsentFormsService } from './consent-forms.service';
import { CreateConsentFormDto, QueryConsentFormDto } from './dto/consent-form.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';

@Controller('consent-forms')
@UseGuards(JwtAuthGuard)
export class ConsentFormsController {
  constructor(private readonly service: ConsentFormsService) {}

  @Post()
  async create(@Body() dto: CreateConsentFormDto, @CurrentUser() user: AuthenticatedUser): Promise<any> {
    return this.service.create(dto, user.studioId);
  }

  @Get()
  async findAll(@Query() query: QueryConsentFormDto, @CurrentUser() user: AuthenticatedUser): Promise<any> {
    return this.service.findAll(user.studioId, query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser): Promise<any> {
    return this.service.findOne(id, user.studioId);
  }

  @Post(':id/send')
  @HttpCode(HttpStatus.OK)
  send(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.send(id, user.studioId);
  }
}

import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { Studio } from '@gpower/db';
import { StudiosService } from './studios.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { StudioSettingsDto, UpdatePaymentConfigDto } from './dto/studio-settings.dto';

@Controller('studios')
@UseGuards(JwtAuthGuard)
export class StudiosController {
  constructor(private readonly studiosService: StudiosService) {}

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Studio | null> {
    return this.studiosService.findById(id);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string): Promise<Studio | null> {
    return this.studiosService.findBySlug(slug);
  }

  @Get('settings')
  async getSettings(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Studio> {
    return this.studiosService.getSettings(user.studioId);
  }

  @Patch('settings')
  async updateSettings(
    @Body() dto: StudioSettingsDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Studio> {
    return this.studiosService.updateSettings(user.studioId, dto);
  }

  @Get('me/payment-config')
  async getPaymentConfig(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.studiosService.getPaymentConfig(user.studioId);
  }

  @Patch('me/payment-config')
  async updatePaymentConfig(
    @Body() dto: UpdatePaymentConfigDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.studiosService.updatePaymentConfig(user.studioId, dto);
  }
}

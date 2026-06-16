import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Studio } from '@gpower/db';
import { StudiosService } from './studios.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Service, ServiceCategory } from '@gpower/db';
import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/create-service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';

@Controller('services')
@UseGuards(JwtAuthGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  async create(
    @Body() dto: CreateServiceDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Service> {
    return this.servicesService.create(dto, user.studioId);
  }

  @Get()
  async findAll(
    @Query('category') category?: ServiceCategory,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<Service[]> {
    return this.servicesService.findAll(user!.studioId, category);
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Service> {
    return this.servicesService.findById(id, user.studioId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Service> {
    return this.servicesService.update(id, dto, user.studioId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    return this.servicesService.remove(id, user.studioId);
  }
}

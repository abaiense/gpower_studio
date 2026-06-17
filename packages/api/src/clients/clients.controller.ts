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
import { Client } from '@gpower/db';
import { ClientsService } from './clients.service';
import {
  CreateClientDto,
  UpdateClientDto,
  SearchClientDto,
  GeneratePhotoUploadUrlDto,
} from './dto/create-client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  async create(
    @Body() dto: CreateClientDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Client> {
    return this.clientsService.create(dto, user.studioId);
  }

  @Get()
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: SearchClientDto = {},
  ): Promise<Client[]> {
    return this.clientsService.findAll(user.studioId, query.search, query.isBlocked);
  }

  @Get('search/phone')
  async findByPhone(
    @Query('phone') phone: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Client | null> {
    return this.clientsService.findByPhone(phone, user.studioId);
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Client> {
    return this.clientsService.findById(id, user.studioId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Client> {
    return this.clientsService.update(id, dto, user.studioId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    return this.clientsService.remove(id, user.studioId);
  }

  @Post(':id/photo-upload-url')
  async generatePhotoUploadUrl(
    @Param('id') id: string,
    @Body() dto: GeneratePhotoUploadUrlDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ uploadUrl: string; photoUrl: string }> {
    return this.clientsService.generatePhotoUploadUrl(
      id,
      user.studioId,
      dto.fileName,
      dto.contentType,
    );
  }
}

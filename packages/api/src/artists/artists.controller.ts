import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Artist } from '@gpower/db';
import { ArtistsService } from './artists.service';
import { CreateArtistDto, UpdateArtistDto, UpsertScheduleDto } from './dto/create-artist.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';

@Controller('artists')
@UseGuards(JwtAuthGuard)
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Post()
  async create(
    @Body() dto: CreateArtistDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Artist> {
    return this.artistsService.create(dto, user.studioId);
  }

  @Get()
  async findAll(@CurrentUser() user: AuthenticatedUser): Promise<Artist[]> {
    return this.artistsService.findAll(user.studioId);
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Artist> {
    return this.artistsService.findById(id, user.studioId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateArtistDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Artist> {
    return this.artistsService.update(id, dto, user.studioId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    return this.artistsService.remove(id, user.studioId);
  }

  @Get(':id/schedules')
  async getSchedules(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.artistsService.getSchedules(id, user.studioId);
  }

  @Put(':id/schedules')
  async upsertSchedules(
    @Param('id') id: string,
    @Body() schedules: UpsertScheduleDto[],
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.artistsService.upsertSchedules(id, schedules, user.studioId);
  }
}

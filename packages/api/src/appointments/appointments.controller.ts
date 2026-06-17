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
import { Appointment } from '@gpower/db';
import { AppointmentsService } from './appointments.service';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  QueryAppointmentDto,
  GetAvailabilityDto,
} from './dto/create-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  async create(
    @Body() dto: CreateAppointmentDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Appointment> {
    return this.appointmentsService.create(dto, user.studioId);
  }

  @Get()
  async findAll(
    @Query() query: QueryAppointmentDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Appointment[]> {
    return this.appointmentsService.findAll(user.studioId, query);
  }

  @Get('availability')
  async getAvailability(
    @Query() query: GetAvailabilityDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Array<{ startAt: string; endAt: string }>> {
    return this.appointmentsService.getAvailability(
      user.studioId,
      query.artistId,
      query.date,
    );
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Appointment> {
    return this.appointmentsService.findById(id, user.studioId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Appointment> {
    return this.appointmentsService.update(id, dto, user.studioId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    return this.appointmentsService.remove(id, user.studioId);
  }
}

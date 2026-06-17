import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { Payment } from '@gpower/db';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async create(
    @Body() dto: CreatePaymentDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Payment> {
    return this.paymentsService.create(dto, user.studioId);
  }

  @Get('appointment/:appointmentId')
  async findByAppointment(
    @Param('appointmentId') appointmentId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Payment[]> {
    return this.paymentsService.findByAppointment(appointmentId, user.studioId);
  }

  @Patch(':id/paid')
  async markPaid(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Payment> {
    return this.paymentsService.markPaid(id, user.studioId);
  }

  @Patch(':id/refund')
  async refund(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Payment> {
    return this.paymentsService.refund(id, user.studioId);
  }
}

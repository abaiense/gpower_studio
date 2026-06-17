import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Payment } from '@gpower/db';
import { PaymentsService } from './payments.service';
import {
  CreatePaymentDto,
  CreateManualPaymentDto,
  CreateCheckoutDto,
  MpWebhookDto,
} from './dto/payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  AuthenticatedUser,
} from '../auth/decorators/current-user.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() dto: CreatePaymentDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Payment> {
    return this.paymentsService.create(dto, user.studioId);
  }

  @Post('manual')
  @UseGuards(JwtAuthGuard)
  async createManual(
    @Body() dto: CreateManualPaymentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.paymentsService.createManual(dto, user.studioId);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async createCheckout(
    @Body() dto: CreateCheckoutDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.paymentsService.createCheckout(dto, user.studioId);
  }

  @Post('mp-webhook')
  @HttpCode(HttpStatus.OK)
  async mpWebhook(
    @Query('studio_id') studioId: string,
    @Body() body: MpWebhookDto,
  ) {
    if (body.type === 'payment' && body.data?.id) {
      await this.paymentsService.handleMpWebhook(studioId, body.data.id);
    }
    return { received: true };
  }

  @Get('appointment/:appointmentId')
  @UseGuards(JwtAuthGuard)
  async findByAppointment(
    @Param('appointmentId') appointmentId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Payment[]> {
    return this.paymentsService.findByAppointment(appointmentId, user.studioId);
  }

  @Patch(':id/paid')
  @UseGuards(JwtAuthGuard)
  async markPaid(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Payment> {
    return this.paymentsService.markPaid(id, user.studioId);
  }

  @Patch(':id/refund')
  @UseGuards(JwtAuthGuard)
  async refund(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Payment> {
    return this.paymentsService.refund(id, user.studioId);
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Payment, PaymentStatus } from '@gpower/db';
import axios, { AxiosError } from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePaymentDto,
  CreateManualPaymentDto,
  CreateCheckoutDto,
} from './dto/payment.dto';

const PUBLIC_URL = process.env['PUBLIC_URL'] ?? 'http://localhost:3000';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePaymentDto, studioId: string): Promise<Payment> {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: dto.appointmentId, studioId },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');

    return this.prisma.payment.create({
      data: {
        amount: dto.amount,
        method: dto.method,
        appointmentId: dto.appointmentId,
        externalId: dto.externalId ?? null,
        gateway: dto.gateway ?? null,
      },
    });
  }

  async findByAppointment(
    appointmentId: string,
    studioId: string,
  ): Promise<Payment[]> {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, studioId },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');

    return this.prisma.payment.findMany({
      where: { appointmentId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async markPaid(id: string, studioId: string): Promise<Payment> {
    const payment = await this.prisma.payment.findFirst({
      where: { id, appointment: { studioId } },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    return this.prisma.payment.update({
      where: { id },
      data: { status: PaymentStatus.PAID, paidAt: new Date() },
    });
  }

  async refund(id: string, studioId: string): Promise<Payment> {
    const payment = await this.prisma.payment.findFirst({
      where: { id, appointment: { studioId } },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status !== PaymentStatus.PAID) {
      throw new BadRequestException('Only PAID payments can be refunded');
    }

    return this.prisma.payment.update({
      where: { id },
      data: { status: PaymentStatus.REFUNDED },
    });
  }

  async createManual(
    dto: CreateManualPaymentDto,
    studioId: string,
  ): Promise<Payment> {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: dto.appointmentId, studioId },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');

    const installmentValue =
      dto.installments && dto.installments > 1
        ? Math.round((dto.amount / dto.installments) * 100) / 100
        : undefined;

    return this.prisma.payment.create({
      data: {
        amount: dto.amount,
        method: dto.method,
        status: PaymentStatus.PAID,
        source: 'infinitepay',
        installments: dto.installments ?? null,
        installmentValue: installmentValue ?? null,
        paidAt: new Date(),
        appointmentId: dto.appointmentId,
      },
    });
  }

  async createCheckout(
    dto: CreateCheckoutDto,
    studioId: string,
  ): Promise<Payment & { checkoutUrl: string }> {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: dto.appointmentId, studioId },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');

    const studio = await this.prisma.studio.findUnique({
      where: { id: studioId },
    });
    if (!studio?.mpAccessToken) {
      throw new BadRequestException(
        'MercadoPago não configurado para este estúdio. Configure em Configurações > Pagamentos.',
      );
    }

    let mpData: { id: string; init_point: string };
    try {
      const mpRes = await axios.post<{ id: string; init_point: string }>(
        'https://api.mercadopago.com/checkout/preferences',
        {
          items: [
            {
              title: dto.description ?? 'Sessão de tatuagem',
              quantity: 1,
              unit_price: dto.amount,
              currency_id: 'BRL',
            },
          ],
          payment_methods: { installments: dto.maxInstallments ?? 12 },
          notification_url: `${PUBLIC_URL}/api/payments/mp-webhook?studio_id=${studioId}`,
          metadata: { studioId },
        },
        { headers: { Authorization: `Bearer ${studio.mpAccessToken}` } },
      );
      mpData = mpRes.data;
    } catch (err) {
      const status = (err as AxiosError)?.response?.status;
      const message =
        status === 401
          ? 'Token MercadoPago inválido.'
          : 'Erro ao criar preferência no MercadoPago. Tente novamente.';
      throw new InternalServerErrorException(message);
    }

    const { id: preferenceId, init_point: checkoutUrl } = mpData;

    const payment = await this.prisma.payment.create({
      data: {
        amount: dto.amount,
        method: 'CREDIT_CARD' as const,
        status: PaymentStatus.PENDING,
        source: 'mercadopago',
        externalId: preferenceId,
        gateway: 'mercadopago',
        checkoutUrl,
        appointmentId: dto.appointmentId,
      },
    });

    return { ...payment, checkoutUrl };
  }

  async handleMpWebhook(
    studioId: string,
    mpPaymentId: string,
  ): Promise<void> {
    const studio = await this.prisma.studio.findUnique({
      where: { id: studioId },
    });
    if (!studio?.mpAccessToken) return;

    let mpStatus: string;
    let metadata: { payment_id?: string };
    let installments: number | undefined;
    try {
      const mpRes = await axios.get<{
        status: string;
        metadata: { payment_id?: string };
        installments?: number;
      }>(
        `https://api.mercadopago.com/v1/payments/${mpPaymentId}`,
        { headers: { Authorization: `Bearer ${studio.mpAccessToken}` } },
      );
      mpStatus = mpRes.data.status;
      metadata = mpRes.data.metadata;
      installments = mpRes.data.installments;
    } catch {
      // Silently ignore MP API errors — the webhook will be retried by MP
      return;
    }

    const internalPaymentId = metadata?.payment_id;
    if (!internalPaymentId) return;

    // Scope lookup to studioId to prevent cross-studio payment manipulation
    const payment = await this.prisma.payment.findFirst({
      where: { id: internalPaymentId, appointment: { studioId } },
    });
    if (!payment || payment.status === PaymentStatus.PAID) return;

    if (mpStatus === 'approved') {
      await this.prisma.payment.update({
        where: { id: internalPaymentId },
        data: {
          status: PaymentStatus.PAID,
          paidAt: new Date(),
          externalId: mpPaymentId,
          installments: installments ?? null,
        },
      });
    }
  }
}

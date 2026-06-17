import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateFlashSlotDto, QueryFlashSlotDto } from './dto/flash-sale.dto';

const PUBLIC_URL = process.env['PUBLIC_URL'] ?? 'http://localhost:3000';

@Injectable()
export class FlashSalesService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async create(dto: CreateFlashSlotDto, studioId: string) {
    if (dto.discountPrice >= dto.originalPrice) {
      throw new BadRequestException(
        'O preço com desconto deve ser menor que o preço original.',
      );
    }

    const claimToken = crypto.randomUUID();

    const slot = await this.prisma.flashSlot.create({
      data: {
        title: dto.title,
        description: dto.description,
        originalPrice: dto.originalPrice,
        discountPrice: dto.discountPrice,
        sessionAt: new Date(dto.sessionAt),
        claimDeadline: new Date(dto.claimDeadline),
        status: 'OPEN',
        claimToken,
        artistId: dto.artistId,
        serviceId: dto.serviceId,
        studioId,
      },
    });

    const claimUrl = `${PUBLIC_URL}/flash/${claimToken}`;
    const discount = Math.round(
      ((dto.originalPrice - dto.discountPrice) / dto.originalPrice) * 100,
    );

    const clients = await this.prisma.client.findMany({
      where: { studioId, phone: { not: null } },
      select: { id: true, firstName: true, phone: true },
    });

    for (const client of clients) {
      if (!client.phone) continue;
      await this.notifications.send({
        channel: 'whatsapp',
        template: 'FLASH_SALE_BROADCAST',
        recipient: { phone: client.phone, name: client.firstName },
        data: {
          clientName: client.firstName,
          title: dto.title,
          discountPrice: String(dto.discountPrice),
          originalPrice: String(dto.originalPrice),
          discount: String(discount),
          claimUrl,
          deadline: new Date(dto.claimDeadline).toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
          }),
        },
        studioId,
      });
    }

    return slot;
  }

  async findAll(studioId: string, query: QueryFlashSlotDto) {
    return this.prisma.flashSlot.findMany({
      where: {
        studioId,
        ...(query.status ? { status: query.status as never } : {}),
      },
      include: {
        artist: { select: { firstName: true, lastName: true } },
        service: { select: { name: true } },
        claimedByClient: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, studioId: string) {
    const slot = await this.prisma.flashSlot.findFirst({
      where: { id, studioId },
      include: {
        artist: { select: { firstName: true, lastName: true } },
        service: { select: { name: true } },
      },
    });
    if (!slot) throw new NotFoundException(`FlashSlot ${id} not found`);
    return slot;
  }

  async cancel(id: string, studioId: string) {
    const slot = await this.prisma.flashSlot.findFirst({
      where: { id, studioId },
    });
    if (!slot) throw new NotFoundException(`FlashSlot ${id} not found`);
    if (slot.status !== 'OPEN') {
      throw new BadRequestException(
        `Só é possível cancelar slots com status OPEN. Status atual: ${slot.status}`,
      );
    }
    return this.prisma.flashSlot.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }
}

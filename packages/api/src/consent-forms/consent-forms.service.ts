import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateConsentFormDto, QueryConsentFormDto } from './dto/consent-form.dto';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env['JWT_SECRET'] ?? 'dev-secret';
const PUBLIC_URL = process.env['PUBLIC_URL'] ?? 'http://localhost:3000';

const FORM_TEMPLATES: Record<string, { title: string; clauses: string }> = {
  TATTOO_ADULT: {
    title: 'Termo de Consentimento — Tatuagem',
    clauses: [
      'Declaro que sou maior de 18 anos e estou em plenas condições de saúde.',
      'Estou ciente dos riscos inerentes ao procedimento de tatuagem.',
      'Fui informado(a) sobre os cuidados pós-tatuagem.',
      'Autorizo a divulgação de imagens do trabalho para fins de portfólio.',
    ].join('||'),
  },
  PIERCING_ADULT: {
    title: 'Termo de Consentimento — Piercing',
    clauses: [
      'Declaro que sou maior de 18 anos e estou em plenas condições de saúde.',
      'Estou ciente dos riscos inerentes ao procedimento de piercing.',
      'Fui informado(a) sobre os cuidados pós-piercing.',
    ].join('||'),
  },
  MINOR: {
    title: 'Termo de Consentimento — Menor de Idade',
    clauses: [
      'Declaro ser responsável legal pelo(a) menor identificado(a) neste formulário.',
      'Autorizo a realização do procedimento.',
      'Estou ciente de que devo acompanhar o procedimento.',
    ].join('||'),
  },
  TOUCH_UP: {
    title: 'Termo de Consentimento — Retoque',
    clauses: [
      'Declaro que já realizei anteriormente o procedimento neste estúdio.',
      'Estou ciente dos cuidados pós-retoque.',
    ].join('||'),
  },
};

@Injectable()
export class ConsentFormsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async create(dto: CreateConsentFormDto, studioId: string) {
    const template = FORM_TEMPLATES[dto.formType] ?? FORM_TEMPLATES['TATTOO_ADULT'];
    return this.prisma.consentForm.create({
      data: {
        formType: dto.formType,
        data: template,
        clientId: dto.clientId,
        studioId,
        ...(dto.appointmentId ? { appointmentId: dto.appointmentId } : {}),
        ...(dto.projectId ? { projectId: dto.projectId } : {}),
      },
    });
  }

  async findAll(studioId: string, query: QueryConsentFormDto) {
    return this.prisma.consentForm.findMany({
      where: {
        studioId,
        ...(query.clientId ? { clientId: query.clientId } : {}),
        ...(query.status === 'SIGNED' ? { signedAt: { not: null } } : {}),
        ...(query.status === 'PENDING' ? { signedAt: null } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, studioId: string) {
    const form = await this.prisma.consentForm.findFirst({ where: { id, studioId } });
    if (!form) throw new NotFoundException(`ConsentForm ${id} not found`);
    return form;
  }

  async send(id: string, studioId: string) {
    const form = await this.findOne(id, studioId);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const token = jwt.sign(
      { consentFormId: id, studioId },
      JWT_SECRET,
      { expiresIn: '7d', audience: 'consent-sign' },
    );
    await this.prisma.consentForm.update({
      where: { id },
      data: { consentToken: token, consentTokenExpiresAt: expiresAt },
    });

    const consentUrl = `${PUBLIC_URL}/consent/${token}`;

    const client = await this.prisma.client.findFirst({ where: { id: form.clientId, studioId } });
    if (client) {
      await this.notifications.send({
        channel: 'whatsapp',
        template: 'CONSENT_REQUEST',
        recipient: {
          phone: client.phone ?? '',
          name: `${client.firstName} ${client.lastName}`,
        },
        data: {
          clientName: client.firstName,
          consentUrl,
        },
        studioId,
      });
    }

    return { token, consentUrl };
  }
}

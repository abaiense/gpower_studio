import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import axios from 'axios';
import * as sgMail from '@sendgrid/mail';
import { Studio } from '@gpower/db';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotificationJobDto,
  NotificationTemplate,
} from './dto/notification.dto';

const TEMPLATE_MAP: Record<NotificationTemplate, string> = {
  APPOINTMENT_CONFIRMATION: 'gpower_appointment_confirmation',
  APPOINTMENT_REMINDER: 'gpower_appointment_reminder',
  DEPOSIT_REQUEST: 'gpower_deposit_request',
  AFTERCARE_DAY1: 'gpower_aftercare_day1',
  ART_APPROVAL_REQUEST: 'gpower_art_approval_request',
  CONSENT_REQUEST: 'gpower_consent_request',
  FLASH_SALE_BROADCAST: 'gpower_flash_sale_broadcast',
  FLASH_SALE_CLAIMED: 'gpower_flash_sale_claimed',
};

const EMAIL_TEMPLATE_MAP: Record<NotificationTemplate, string> = {
  APPOINTMENT_CONFIRMATION: 'd-gpower_confirmation',
  APPOINTMENT_REMINDER: 'd-gpower_reminder',
  DEPOSIT_REQUEST: 'd-gpower_deposit',
  AFTERCARE_DAY1: 'd-gpower_aftercare',
  ART_APPROVAL_REQUEST: 'd-gpower_art_approval',
  CONSENT_REQUEST: 'd-gpower_consent',
  FLASH_SALE_BROADCAST: 'd-gpower_flash_sale',
  FLASH_SALE_CLAIMED: 'd-gpower_flash_claimed',
};

@Processor('notifications')
export class NotificationsProcessor {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  @Process()
  async handleNotification(job: Job<NotificationJobDto>): Promise<void> {
    const { channel, template, recipient, data, studioId } = job.data;

    const studio = await this.prisma.studio.findUnique({ where: { id: studioId } });
    if (!studio) {
      this.logger.warn(`Studio not found for notification job: studioId=${studioId}`);
      return;
    }

    if (channel === 'whatsapp' && studio.whatsappEnabled && studio.whatsappPhoneNumberId) {
      await this.sendWhatsApp(studio, recipient, template, data);
    } else if (channel === 'email' && studio.emailEnabled && studio.emailFromAddress) {
      await this.sendEmail(studio, recipient, template, data);
    } else {
      this.logger.debug(
        `Skipping notification: channel=${channel} not configured for studio=${studioId}`,
      );
    }
  }

  private async sendWhatsApp(
    studio: Studio,
    recipient: { phone?: string; name: string },
    template: NotificationTemplate,
    data: Record<string, string>,
  ): Promise<void> {
    if (!recipient.phone) {
      this.logger.warn('WhatsApp notification skipped: no phone number for recipient');
      return;
    }

    const parameters = Object.values(data).map((value) => ({
      type: 'text',
      text: value,
    }));

    try {
      await axios.post(
        `https://graph.facebook.com/v18.0/${studio.whatsappPhoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: recipient.phone,
          type: 'template',
          template: {
            name: TEMPLATE_MAP[template],
            language: { code: 'pt_BR' },
            components: [
              {
                type: 'body',
                parameters,
              },
            ],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${studio.whatsappAccessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(
        `WhatsApp sent: template=${template} to=${recipient.phone} studio=${studio.id}`,
      );
    } catch (err) {
      this.logger.error(
        `WhatsApp send failed: template=${template} to=${recipient.phone} studio=${studio.id}`,
        err instanceof Error ? err.message : String(err),
      );
    }
  }

  private async sendEmail(
    studio: Studio,
    recipient: { email?: string; name: string },
    template: NotificationTemplate,
    data: Record<string, string>,
  ): Promise<void> {
    if (!recipient.email) {
      this.logger.warn('Email notification skipped: no email address for recipient');
      return;
    }

    const sendgridApiKey = process.env['SENDGRID_API_KEY'];
    if (!sendgridApiKey) {
      this.logger.warn('SendGrid API key not configured (SENDGRID_API_KEY missing)');
      return;
    }

    sgMail.setApiKey(sendgridApiKey);

    try {
      await sgMail.send({
        to: { email: recipient.email, name: recipient.name },
        from: {
          email: studio.emailFromAddress!,
          name: studio.emailFromName ?? studio.name,
        },
        templateId: EMAIL_TEMPLATE_MAP[template],
        dynamicTemplateData: data,
      });

      this.logger.log(
        `Email sent: template=${template} to=${recipient.email} studio=${studio.id}`,
      );
    } catch (err) {
      this.logger.error(
        `Email send failed: template=${template} to=${recipient.email} studio=${studio.id}`,
        err instanceof Error ? err.message : String(err),
      );
    }
  }
}

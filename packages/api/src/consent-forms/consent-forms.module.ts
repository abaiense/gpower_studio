import { Module } from '@nestjs/common';
import { ConsentFormsController } from './consent-forms.controller';
import { ConsentFormsService } from './consent-forms.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule.forRoot()],
  controllers: [ConsentFormsController],
  providers: [ConsentFormsService],
  exports: [ConsentFormsService],
})
export class ConsentFormsModule {}

import { Module } from '@nestjs/common';
import { ArtFilesController } from './art-files.controller';
import { ArtFilesService } from './art-files.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [ArtFilesController],
  providers: [ArtFilesService],
  exports: [ArtFilesService],
})
export class ArtFilesModule {}

import { Module, DynamicModule } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NotificationsService } from './notifications.service';

@Module({})
export class NotificationsModule {
  static forRoot(): DynamicModule {
    const hasRedis = !!(process.env['REDIS_URL'] && process.env['REDIS_URL'].length > 0);

    const imports: any[] = [];
    const providers: any[] = [NotificationsService];

    if (hasRedis) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { NotificationsProcessor } = require('./notifications.processor');
      imports.push(BullModule.registerQueue({ name: 'notifications' }));
      providers.push(NotificationsProcessor);
    }

    return {
      module: NotificationsModule,
      imports,
      providers,
      exports: [NotificationsService],
    };
  }
}

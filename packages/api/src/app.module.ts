import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StudiosModule } from './studios/studios.module';
import { ArtistsModule } from './artists/artists.module';
import { ClientsModule } from './clients/clients.module';
import { ServicesModule } from './services/services.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ProjectsModule } from './projects/projects.module';
import { ArtFilesModule } from './art-files/art-files.module';
import { ConsentFormsModule } from './consent-forms/consent-forms.module';
import { PublicModule } from './public/public.module';
import { FlashSalesModule } from './flash-sales/flash-sales.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({}),
    PrismaModule,
    AuthModule,
    UsersModule,
    StudiosModule,
    ArtistsModule,
    ClientsModule,
    ServicesModule,
    AppointmentsModule,
    PaymentsModule,
    NotificationsModule.forRoot(),
    ProjectsModule,
    ArtFilesModule,
    ConsentFormsModule,
    PublicModule,
    FlashSalesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}

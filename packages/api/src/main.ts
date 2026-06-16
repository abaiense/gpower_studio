import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: process.env['ALLOWED_ORIGINS']?.split(',') ?? [
      'http://localhost:3000',
      'http://localhost:3002',
    ],
    credentials: true,
  });

  const port = process.env['PORT'] ?? 3001;
  await app.listen(port);

  console.log(`GPower API running on: http://localhost:${port}/api/v1`);
}

bootstrap();

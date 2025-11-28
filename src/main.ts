/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import {
  AllExceptionsFilter,
  ResponseInterceptor,
  LoggingInterceptor,
} from '@app/common';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api/v1');

    app.enableCors({
      // origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      origin: '*',
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    app.useGlobalFilters(new AllExceptionsFilter());

    app.useGlobalInterceptors(
      new LoggingInterceptor(),
      new ResponseInterceptor(),
    );

    const port = parseInt(process.env.PORT || '3001', 10);
    await app.listen(port);

    logger.log(`Application running: http://localhost:${port}/api/v1`);
    logger.log(`WebSocket endpoint: ws://localhost:${port}/notifications`);
    logger.log(`Socket.IO endpoint: http://localhost:${port}/notifications`);
    logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  } catch (error) {
    logger.error('Error starting application:', error);
    process.exit(1);
  }
}

void bootstrap();

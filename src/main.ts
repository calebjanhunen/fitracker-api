import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggerService } from './common/logger/logger.service';

async function bootstrap() {
  setEnvFile();
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors({
    origin: process.env.FITRACKER_WEBSITE_URL,
    methods: 'PATCH',
    credentials: true,
  });

  const logger = await app.resolve(LoggerService);
  logger.setContext('Bootstrap');

  await app.listen(3000);
  logger.log(`Environment: ${process.env.NODE_ENV}`);
}
bootstrap();

function setEnvFile() {
  if (process.env.NODE_ENV === 'test') {
    dotenv.config({ path: '.env.test' });
  } else if (process.env.NODE_ENV === 'dev') {
    dotenv.config({ path: '.env' });
  }
}

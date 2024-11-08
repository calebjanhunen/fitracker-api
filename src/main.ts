import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { LoggerServiceV2 } from './common/logger/logger-v2.service';

async function bootstrap() {
  setEnvFile();
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const logger = await app.resolve(LoggerServiceV2);
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

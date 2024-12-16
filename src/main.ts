import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggerService } from './common/logger/logger.service';

async function bootstrap() {
  setEnvFile();
  const app = await NestFactory.create(AppModule);

  // Setup pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Setup filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Setup cors
  app.enableCors({
    origin: process.env.FITRACKER_WEBSITE_URL,
    methods: 'PATCH',
    credentials: true,
  });

  // setup logger
  const logger = await app.resolve(LoggerService);
  logger.setContext('Bootstrap');

  // Setup swagger
  const config = new DocumentBuilder()
    .setTitle('Fitracker API')
    .setDescription('Api documentation for Fitracker')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/', app, document);

  // Start app
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

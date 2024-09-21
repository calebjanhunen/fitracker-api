import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { EndpointLoggingInterceptor } from './common/interceptors/endpoint-logger.interceptor';
import { MyLoggerService } from './common/logger/logger.service';
// import { HttpExceptionFilter } from './common/exceptions/http-exception.filter';

async function bootstrap() {
  setEnvFile();
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalInterceptors(
    new EndpointLoggingInterceptor(new MyLoggerService(AppModule.name)),
  );
  // app.useLogger(new MyLogger());
  // app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3000);
}
bootstrap();

function setEnvFile() {
  if (process.env.NODE_ENV === 'test') {
    dotenv.config({ path: '.env.test' });
  } else if (process.env.NODE_ENV === 'dev') {
    dotenv.config({ path: '.env' });
  }
}

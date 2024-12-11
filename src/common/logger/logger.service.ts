import {
  Injectable,
  Logger as NestLogger,
  LoggerService as NestLoggerService,
  Scope,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private logger: PinoLogger | NestLogger;
  private context: string;

  constructor(
    pinoLogger: PinoLogger,
    private readonly configService: ConfigService,
  ) {
    if (this.isProduction()) {
      this.logger = pinoLogger;
    } else {
      this.logger = new NestLogger();
    }
  }

  public log(message: any, ...optionalParams: any[]) {
    if (!this.shouldLog()) {
      return;
    }

    if (this.isProduction()) {
      (this.logger as PinoLogger).info(
        { properties: optionalParams[0], context: this.context },
        message,
      );
    } else {
      (this.logger as NestLogger).log(message, this.context);
    }
  }

  public error(error: Error, message: any, ...optionalParams: any[]) {
    if (!this.shouldLog()) {
      return;
    }

    if (this.isProduction()) {
      (this.logger as PinoLogger).error(
        {
          stack: error.stack,
          message: error.message,
          context: this.context,
          properties: optionalParams[0],
        },
        message,
      );
    } else {
      (this.logger as NestLogger).error(message, error.stack, this.context);
    }
  }

  public warn(message: any, ...optionalParams: any[]) {
    if (!this.shouldLog()) {
      return;
    }

    if (this.isProduction()) {
      (this.logger as PinoLogger).warn(
        { properties: optionalParams[0], context: this.context },
        message,
      );
    } else {
      (this.logger as NestLogger).warn(message, this.context);
    }
  }

  private isProduction(): boolean {
    return this.configService.getOrThrow('NODE_ENV') === 'production';
  }

  private shouldLog(): boolean {
    return this.configService.getOrThrow('NODE_ENV') !== 'test';
  }

  public setContext(context: string) {
    this.context = context;
  }
}

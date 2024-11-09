import { Injectable, LoggerService, Scope } from '@nestjs/common';
import * as winston from 'winston';
const { combine, timestamp, printf, colorize } = winston.format;

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerServiceV2 implements LoggerService {
  private readonly logger: winston.Logger;
  private context: string;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: combine(
        colorize({ level: true }),
        timestamp(),
        printf(({ level, message, timestamp, stack }) => {
          return `[${timestamp}] | ${level} | [${this.context}]: ${message} ${
            stack ? `| ${stack}` : ''
          }`;
        }),
      ),
      transports: [new winston.transports.Console()],
    });
  }

  log(message: string) {
    if (this.isTestEnvironment()) return;
    this.logger.info(message);
  }

  error(message: string, error: Error) {
    if (this.isTestEnvironment()) return;
    this.logger.error(message, { stack: error.stack });
  }

  warn(message: string) {
    if (this.isTestEnvironment()) return;
    this.logger.warn(message);
  }

  debug(message: string) {
    if (this.isTestEnvironment()) return;
    this.logger.debug(message);
  }

  private isTestEnvironment(): boolean {
    if (process.env.NODE_ENV === 'test') {
      return true;
    }
    return false;
  }

  public setContext(context: string) {
    this.context = context;
  }
}

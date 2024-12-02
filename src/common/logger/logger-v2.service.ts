import { Injectable, LoggerService, Scope } from '@nestjs/common';
import * as winston from 'winston';
const { combine, timestamp, printf, colorize } = winston.format;

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerServiceV2 implements LoggerService {
  private readonly logger: winston.Logger;
  private context: string;

  constructor() {
    const jsonFormat = printf(({ timestamp, level, message, ...meta }) => {
      const properties =
        meta['0'] && typeof meta['0'] === 'object' ? meta['0'] : meta;
      return JSON.stringify({
        timestamp,
        level,
        message,
        properties,
      });
    });

    this.logger = winston.createLogger({
      level: 'info',
      format: combine(timestamp()),
      transports: [
        new winston.transports.Console({
          format: combine(
            colorize(),
            printf(({ level, message, timestamp, stack }) => {
              return `[${timestamp}] | ${level} | [${
                this.context
              }]: ${message} ${stack ? `| ${stack}` : ''}`;
            }),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/fitracker.log',
          format: jsonFormat,
        }),
      ],
    });
  }

  log(message: string, ...meta: any[]) {
    if (this.isTestEnvironment()) return;
    this.logger.info(message, meta);
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

import { Injectable, Logger } from '@nestjs/common';
import { CorrelationIdService } from '../services/correlation-id.service';

@Injectable()
export class MyLoggerService extends Logger {
  constructor(context: string) {
    super(context);
  }

  log(message: string) {
    const correlationId = CorrelationIdService.getCorrelationId();
    if (process.env.ENVIRONMENT !== 'test') {
      super.log(`[${correlationId}] ${message}`);
    }
  }

  error(message: string, trace: string) {
    const correlationId = CorrelationIdService.getCorrelationId();
    if (process.env.ENVIRONMENT !== 'test') {
      super.error(`[${correlationId}] ${message}`, trace);
    }
  }

  warn(message: string) {
    const correlationId = CorrelationIdService.getCorrelationId();
    if (process.env.ENVIRONMENT !== 'test') {
      super.warn(`[${correlationId}] ${message}`);
    }
  }

  debug(message: string) {
    const correlationId = CorrelationIdService.getCorrelationId();
    if (process.env.ENVIRONMENT !== 'test') {
      super.debug(`[${correlationId}] ${message}`);
    }
  }

  verbose(message: string) {
    const correlationId = CorrelationIdService.getCorrelationId();
    if (process.env.ENVIRONMENT !== 'test') {
      super.verbose(`[${correlationId}] ${message}`);
    }
  }
}

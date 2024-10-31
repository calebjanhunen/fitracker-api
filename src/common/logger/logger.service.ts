import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MyLoggerService extends Logger {
  constructor(context: string) {
    super(context);
  }

  log(message: string) {
    if (process.env.ENVIRONMENT !== 'test') {
      super.log(`${message}`);
    }
  }

  error(message: string, trace: string) {
    if (process.env.ENVIRONMENT !== 'test') {
      super.error(`${message}`, trace);
    }
  }

  warn(message: string) {
    if (process.env.ENVIRONMENT !== 'test') {
      super.warn(`${message}`);
    }
  }

  debug(message: string) {
    if (process.env.ENVIRONMENT !== 'test') {
      super.debug(`${message}`);
    }
  }

  verbose(message: string) {
    if (process.env.ENVIRONMENT !== 'test') {
      super.verbose(`${message}`);
    }
  }
}

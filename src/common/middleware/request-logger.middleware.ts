import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { LoggerServiceV2 } from '../logger/logger-v2.service';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(private logger: LoggerServiceV2) {
    this.logger.setContext('HTTP');
  }

  public use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const { originalUrl, method } = req;

    this.logger.log(`Starting request ${method}: ${originalUrl}`);

    res.on('finish', () => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      const { statusCode } = res;

      this.logger.log(
        `End request ${method}: ${originalUrl} | Status: ${statusCode} - ${duration}ms`,
      );
    });

    next();
  }
}

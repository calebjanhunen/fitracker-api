import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { v4 } from 'uuid';
import { CorrelationIdService } from '../services/correlation-id.service';

@Injectable()
export class AssignCorrelationIdMiddleware implements NestMiddleware {
  constructor(private readonly correlationIdService: CorrelationIdService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const correlationId = v4();
    const namespace = CorrelationIdService['getNamespace']();

    namespace.run(() => {
      CorrelationIdService.setCorrelationId(correlationId);
      next();
    });
  }
}

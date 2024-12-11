import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('HTTP');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const now = Date.now();

    this.logger.log(`Starting request ${request.method}: ${request.url}`);

    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          `Ending request ${request.method}: ${request.url} | Status: ${
            response.statusCode
          } - ${Date.now() - now}ms`,
        );
      }),
    );
  }
}

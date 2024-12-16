import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
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
        const elapsed = Date.now() - now;
        this.logger.log(
          `Ending request ${request.method}: ${request.url} | Status: ${response.statusCode} - ${elapsed}ms`,
        );
      }),
      catchError((error) => {
        const elapsed = Date.now() - now;
        this.logger.log(
          `Ending request ${request.method}: ${request.url} | Status: ${error.status}, message: ${error.message} - ${elapsed}ms`,
        );

        // Re-throw the error so NestJS can handle it
        return throwError(() => error);
      }),
    );
  }
}

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MyLoggerService } from '../logger/logger.service'; // Assuming you have MyLoggerService

@Injectable()
export class EndpointLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: MyLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    this.logger.log(`Starting ${method} ${url}`);

    const startTime = Date.now();
    return next.handle().pipe(
      tap(() => {
        // Log the end of the request
        const duration = Date.now() - startTime;
        this.logger.log(`Completed ${method} ${url} in ${duration}ms`);
      }),
    );
  }
}

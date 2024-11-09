import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { lastValueFrom, Observable } from 'rxjs';
import { LoggerServiceV2 } from '../logger/logger-v2.service';
import { JwtAuthGuard } from './jwt-auth.guard'; // Adjust the path if needed

@Injectable()
export class JwtAuthGlobalGuard extends JwtAuthGuard {
  constructor(
    logger: LoggerServiceV2,
    configService: ConfigService,
    jwtService: JwtService,
  ) {
    super(logger, configService, jwtService); // Call the JwtAuthGuard constructor
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Bypass JwtAuthGuard for routes in AuthModule (e.g., `/auth/*` routes)
    const { route } = request;
    if (route && route.path.startsWith('/auth')) {
      return true; // Skip guard for `/auth/*` routes
    }

    // Otherwise, apply the JwtAuthGuard as usual
    const result = super.canActivate(context);
    if (result instanceof Promise) {
      return result;
    } else if (result instanceof Observable) {
      return lastValueFrom(result);
    }
    return result;
  }
}

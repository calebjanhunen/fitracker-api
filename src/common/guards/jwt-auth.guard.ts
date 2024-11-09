import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { LoggerServiceV2 } from '../logger/logger-v2.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private TOKEN_EXPIRED_ERROR_NAME = 'TokenExpiredError';
  private JSON_WEB_TOKEN_ERROR = 'JsonWebTokenError';
  constructor(
    private readonly logger: LoggerServiceV2,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    super();
    this.logger.setContext(JwtAuthGuard.name);
  }

  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
  ): TUser {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.headers['authorization']?.split(' ')[1]; // Get rid of 'Bearer'
    if (!accessToken) {
      throw new UnauthorizedException('No authorization header in request');
    }
    const deviceId = request.headers['x-device-id'] as string;
    const { userId } = this.jwtService.verify(accessToken, {
      secret: this.configService.getOrThrow('ACCESS_TOKEN_SECRET'),
      ignoreExpiration: true,
    });

    if (err || !user) {
      if (
        info?.name == this.TOKEN_EXPIRED_ERROR_NAME ||
        info?.name === this.JSON_WEB_TOKEN_ERROR
      ) {
        this.logger.log(
          `Access token has expired for user '${userId}' and device: '${deviceId}'.`,
        );
      }
      throw err || new UnauthorizedException('Access token is expired');
    }
    return user;
  }
}

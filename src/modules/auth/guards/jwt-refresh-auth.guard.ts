import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { LoggerServiceV2 } from 'src/common/logger/logger-v2.service';
import { UserRefreshTokenService } from 'src/modules/user/service/user-refresh-token.service';

@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard('jwt-refresh') {
  private TOKEN_EXPIRED_ERROR_NAME = 'TokenExpiredError';
  private JSON_WEB_TOKEN_ERROR = 'JsonWebTokenError';
  constructor(
    private readonly userRefreshTokenService: UserRefreshTokenService,
    private readonly logger: LoggerServiceV2,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    super();
    this.logger.setContext(JwtRefreshAuthGuard.name);
  }

  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
  ): TUser {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.headers['x-refresh-token'] as string;
    const deviceId = request.headers['x-device-id'] as string;
    const { userId } = this.jwtService.verify(refreshToken, {
      secret: this.configService.getOrThrow('REFRESH_TOKEN_SECRET'),
      ignoreExpiration: true,
    });

    if (err || !user) {
      if (
        info?.name == this.TOKEN_EXPIRED_ERROR_NAME ||
        info?.name === this.JSON_WEB_TOKEN_ERROR
      ) {
        this.logger.log(
          `Refresh token has expired. Removing refresh token for user '${userId}' and device: '${deviceId}'.`,
        );
        this.userRefreshTokenService
          .deleteRefreshToken(userId, deviceId)
          .catch((e) => {
            this.logger.error('Error deleting refresh token', e);
          });
      }

      throw err || new UnauthorizedException('Refresh token is expired');
    }

    return user;
  }
}
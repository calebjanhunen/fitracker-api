import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { LoggerServiceV2 } from 'src/common/logger/logger-v2.service';
import { AuthService } from '../service/auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
    private logger: LoggerServiceV2,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromHeader('x-refresh-token'),
      secretOrKey: configService.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
    this.logger.setContext(JwtRefreshStrategy.name);
  }
  async validate(request: Request, payload: { userId: string }) {
    try {
      const deviceId = request.headers['x-device-id'] as string;
      if (!deviceId) {
        // This should never happen
        this.logger.error(
          'Request header did not contain device id',
          new Error('No device id in request header'),
        );
        throw new Error();
      }

      const refreshToken = request.headers['x-refresh-token'] as string;
      if (!refreshToken) {
        // This should never happen
        this.logger.error(
          'Request header did not contain refresh token',
          new Error('No refresh token in request header'),
        );
        throw new Error();
      }

      return await this.authService.verifyRefreshToken(
        refreshToken,
        payload.userId,
        deviceId,
      );
    } catch (e) {
      throw new UnauthorizedException(e);
    }
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { LoggerService } from 'src/common/logger/logger.service';
import { generateHashPassword } from '../helpers/password-helper';
import { RefreshTokenRepository } from '../repository/refresh-token.repository';

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly refreshTokenRepo: RefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(AuthTokenService.name);
  }

  public async generateAccessAndRefreshToken(userId: string, deviceId: string) {
    const accessToken = await this.generateAcccessToken(userId);
    const refreshToken = await this.generateRefreshToken(userId);

    let hashedRefreshToken: string;
    try {
      hashedRefreshToken = await generateHashPassword(refreshToken);
    } catch (e) {
      this.logger.error(e, `Error hashing refresh token for user ${userId}`);
      throw e;
    }

    await this.refreshTokenRepo.upsertRefreshToken(
      userId,
      hashedRefreshToken,
      deviceId,
    );

    return { accessToken, refreshToken };
  }

  public async getRefreshToken(
    userId: string,
    deviceId: string,
  ): Promise<string> {
    const refreshToken = await this.refreshTokenRepo.getRefreshToken(
      userId,
      deviceId,
    );
    if (!refreshToken) {
      this.logger.warn(
        `Refresh token for user ${userId} and device ${deviceId} could not be found`,
      );
      throw new ResourceNotFoundException('Refresh token not found');
    }

    return refreshToken;
  }

  public async deleteRefreshToken(
    userId: string,
    deviceId: string,
  ): Promise<void> {
    this.refreshTokenRepo.deleteRefreshToken(userId, deviceId);
  }

  private async generateAcccessToken(userId: string): Promise<string> {
    try {
      return await this.jwtService.signAsync(
        { userId },
        {
          secret: this.configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
          expiresIn: this.configService.getOrThrow(
            'JWT_ACCESS_TOKEN_EXPIRATION_MS',
          ),
        },
      );
    } catch (e) {
      this.logger.error(e, `Error generating access token for user ${userId}`);
      throw e;
    }
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    try {
      return await this.jwtService.signAsync(
        { userId },
        {
          secret: this.configService.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
          expiresIn: this.configService.getOrThrow(
            'JWT_REFRESH_TOKEN_EXPIRATION_MS',
          ),
        },
      );
    } catch (e) {
      this.logger.error(e, `Error generating refresh token for user ${userId}`);
      throw e;
    }
  }
}

import { Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { LoggerServiceV2 } from 'src/common/logger/logger-v2.service';
import { UserRefreshTokenReposistory } from '../repository/user-refresh-token.repository';

@Injectable()
export class UserRefreshTokenService {
  constructor(
    private readonly userRefreshTokenRepo: UserRefreshTokenReposistory,
    private readonly logger: LoggerServiceV2,
  ) {
    this.logger.setContext(UserRefreshTokenService.name);
  }

  public async upsertRefreshToken(
    userId: string,
    refreshToken: string,
    deviceId: string,
  ) {
    await this.userRefreshTokenRepo.upsertRefreshToken(
      userId,
      refreshToken,
      deviceId,
    );
  }

  public async getRefreshToken(
    userId: string,
    deviceId: string,
  ): Promise<string> {
    const refreshToken = await this.userRefreshTokenRepo.getRefreshToken(
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
    this.userRefreshTokenRepo.deleteRefreshToken(userId, deviceId);
  }
}

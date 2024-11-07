import { Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { UserRefreshTokenReposistory } from '../repository/user-refresh-token.repository';

@Injectable()
export class UserRefreshTokenService {
  constructor(
    private readonly userRefreshTokenRepo: UserRefreshTokenReposistory,
  ) {}

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
    deviceId: string | null,
  ): Promise<string> {
    const refreshToken = await this.userRefreshTokenRepo.getRefreshToken(
      userId,
      deviceId,
    );
    if (!refreshToken) {
      throw new ResourceNotFoundException('Refresh token not found');
    }

    return refreshToken;
  }
}

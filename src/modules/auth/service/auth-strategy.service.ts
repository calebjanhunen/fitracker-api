import { Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { LoggerService } from 'src/common/logger/logger.service';
import { comparePasswords } from '../helpers/password-helper';
import { PasswordsDoNotMatchException } from '../internal-exceptions/passwords-do-not-match.exception';
import { UserRepository } from '../repository/user.repository';
import { AuthTokenService } from './auth-token-service';

@Injectable()
export class AuthStrategyService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly authTokenService: AuthTokenService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(AuthStrategyService.name);
  }

  public async verifyUser(username: string, password: string): Promise<string> {
    const user = await this.userRepo.getUserByUsername(username);
    if (!user) {
      throw new ResourceNotFoundException('User not found');
    }

    const doPasswordsMatch = await comparePasswords(password, user.password);

    if (!doPasswordsMatch) {
      throw new PasswordsDoNotMatchException();
    }

    return user.id;
  }

  public async verifyRefreshToken(
    refreshToken: string,
    userId: string,
    deviceId: string,
  ): Promise<string> {
    const existingRefreshToken = await this.authTokenService.getRefreshToken(
      userId,
      deviceId,
    );

    const doRefreshTokensMatch = await comparePasswords(
      refreshToken ?? '',
      existingRefreshToken,
    );

    if (!doRefreshTokensMatch) {
      this.logger.log(
        'Refresh token in request does not match stored refresh token. Removing stored refresh token for user',
      );
      await this.authTokenService.deleteRefreshToken(userId, deviceId);
      throw new Error('Refresh token is not valid');
    }

    return userId;
  }
}

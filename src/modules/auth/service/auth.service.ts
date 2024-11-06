import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { LoggerServiceV2 } from 'src/common/logger/logger-v2.service';
import {
  comparePasswords,
  generateHashPassword,
} from 'src/modules/auth/helpers/password-helper';
import { InsertUserModel } from 'src/modules/user/models/insert-user.model';
import { UserService } from '../../user/service/user.service';
import { PasswordsDoNotMatchException } from '../internal-exceptions/passwords-do-not-match.exception';
import { UserWithEmailAlreadyExistsException } from '../internal-exceptions/user-with-email-already-exists.exception';
import { UserWithUsernameAlreadyExistsException } from '../internal-exceptions/user-with-username-already-exists.exception';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private logger: LoggerServiceV2,
    private configService: ConfigService,
  ) {
    this.logger.setContext(AuthService.name);
  }

  async signIn(username: string, password: string): Promise<string> {
    try {
      const user = await this.userService.findByUsername(username);
      if (!user) {
        throw new ResourceNotFoundException(
          `User not found with username: ${username}`,
        );
      }

      const doPasswordsMatch = await comparePasswords(password, user.password);

      if (!doPasswordsMatch) {
        throw new UnauthorizedException();
      }

      const accessToken = await this.generateAcccessToken(user.id);

      return accessToken;
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  public async verifyUser(username: string, password: string): Promise<string> {
    try {
      const user = await this.userService.findByUsername(username);
      if (!user) {
        this.logger.warn(`Tried accessing non existed user: ${username}`);
        throw new ResourceNotFoundException(
          `User not found with username: ${username}`,
        );
      }

      const doPasswordsMatch = await comparePasswords(password, user.password);

      if (!doPasswordsMatch) {
        throw new PasswordsDoNotMatchException();
      }

      return user.id;
    } catch (error) {
      throw new Error(error);
    }
  }

  public async loginV2(userId: string): Promise<string> {
    return await this.generateAcccessToken(userId);
  }

  public async signup(
    userModel: InsertUserModel,
    confirmPassword: string,
  ): Promise<string> {
    if (await this.userService.findByUsername(userModel.username)) {
      throw new UserWithUsernameAlreadyExistsException(userModel.username);
    }
    if (await this.userService.findByEmail(userModel.email)) {
      throw new UserWithEmailAlreadyExistsException(userModel.email);
    }

    if (userModel.password !== confirmPassword) {
      throw new PasswordsDoNotMatchException();
    }

    const hashedPassword = await generateHashPassword(userModel.password);
    userModel.password = hashedPassword;

    const createdUser = await this.userService.create(userModel);

    const accessToken = await this.generateAcccessToken(createdUser.id);
    return accessToken;
  }

  private async generateAcccessToken(userId: string): Promise<string> {
    return await this.jwtService.signAsync(
      {
        userId,
      },
      {
        secret: this.configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: `${this.configService.getOrThrow<string>(
          'JWT_ACCESS_TOKEN_EXPIRATION_MS',
        )}ms`,
      },
    );
  }
}

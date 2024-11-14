import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { LoggerServiceV2 } from 'src/common/logger/logger-v2.service';
import {
  comparePasswords,
  generateHashPassword,
} from 'src/modules/auth/helpers/password-helper';
import { MailService } from 'src/modules/mail/mail.service';
import { InsertUserModel } from 'src/modules/user/models/insert-user.model';
import { UserRefreshTokenService } from 'src/modules/user/service/user-refresh-token.service';
import { UserService } from '../../user/service/user.service';
import { PasswordsDoNotMatchException } from '../internal-exceptions/passwords-do-not-match.exception';
import { SignupCodeAlreadyUsedException } from '../internal-exceptions/signup-code-alread-used.exception';
import { SignupCodeExpiredException } from '../internal-exceptions/signup-code-expired.exception';
import { EmailAlreadyInUseException } from '../internal-exceptions/user-with-email-already-exists.exception';
import { UserWithUsernameAlreadyExistsException } from '../internal-exceptions/user-with-username-already-exists.exception';
import { AuthSignupCodeRepository } from '../repository/auth-signup-code.repository';

@Injectable()
export class AuthService {
  private SIGNUP_CODE_LENGTH = 6;
  private SIGNUP_CODE_EXPIRES_AT_OFFEST = 1;
  constructor(
    private userService: UserService,
    private userRefreshTokenService: UserRefreshTokenService,
    private jwtService: JwtService,
    private logger: LoggerServiceV2,
    private configService: ConfigService,
    private readonly mailService: MailService,
    private readonly authSignupCodeRepo: AuthSignupCodeRepository,
  ) {
    this.logger.setContext(AuthService.name);
  }

  public async verifyUser(username: string, password: string): Promise<string> {
    const user = await this.userService.findByUsername(username);
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
    const existingRefreshToken =
      await this.userRefreshTokenService.getRefreshToken(userId, deviceId);

    const doRefreshTokensMatch = await comparePasswords(
      refreshToken ?? '',
      existingRefreshToken,
    );

    if (!doRefreshTokensMatch) {
      this.logger.log(
        'Refresh token in request does not match stored refresh token. Removing stored refresh token for user',
      );
      await this.userRefreshTokenService.deleteRefreshToken(userId, deviceId);
      throw new Error('Refresh token is not valid');
    }

    return userId;
  }

  public async login(
    userId: string,
    deviceId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.generateAcccessToken(userId);
    const refreshToken = await this.generateRefreshToken(userId);

    const hashedRefreshToken = await generateHashPassword(refreshToken);
    await this.userRefreshTokenService.upsertRefreshToken(
      userId,
      hashedRefreshToken,
      deviceId,
    );
    return { accessToken, refreshToken };
  }

  public async logout(userId: string, deviceId: string) {
    await this.userRefreshTokenService.deleteRefreshToken(userId, deviceId);
  }

  public async signup(
    userModel: InsertUserModel,
    confirmPassword: string,
    deviceId: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: UserModel }> {
    if (await this.userService.findByUsername(userModel.username)) {
      throw new UserWithUsernameAlreadyExistsException();
    }
    if (await this.userService.findByEmail(userModel.email)) {
      throw new EmailAlreadyInUseException();
    }

    if (userModel.password !== confirmPassword) {
      throw new PasswordsDoNotMatchException();
    }

    const hashedPassword = await generateHashPassword(userModel.password);
    userModel.password = hashedPassword;

    const createdUser = await this.userService.create(userModel);

    const accessToken = await this.generateAcccessToken(createdUser.id);
    const refreshToken = await this.generateRefreshToken(createdUser.id);

    const hashedRefreshToken = await generateHashPassword(refreshToken);
    await this.userRefreshTokenService.upsertRefreshToken(
      createdUser.id,
      hashedRefreshToken,
      deviceId,
    );

    const user = await this.userService.findById(createdUser.id);
    return { accessToken, refreshToken, user };
  }

  /**
   * Saves signup code and sends to email
   * @param {string} email
   *
   * @throws {EmailAlreadyInUseException}
   * @throws {DatabaseException}
   * @throws {MailFailedToSendException}
   */
  public async verifyEmail(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);
    if (user) {
      throw new EmailAlreadyInUseException();
    }

    const signupCodeModel =
      await this.authSignupCodeRepo.getSignupCodeByEmail(email);
    const now = new Date();
    if (
      signupCodeModel &&
      !signupCodeModel.usedAt &&
      signupCodeModel.expiresAt > now
    ) {
      this.logger.log(
        `Valid signup code already exists for ${email}. Not sending email or creating a new code.`,
      );
      return;
    }

    const signupCode = await this.saveSignupCode(email);
    await this.mailService.sendVerificationEmail(email, signupCode);
  }

  public async confirmSignupCode(code: string, email: string): Promise<void> {
    const signupCodeModel = await this.authSignupCodeRepo.getSignupCode(
      code,
      email,
    );
    if (!signupCodeModel) {
      throw new ResourceNotFoundException('Code not found');
    }

    const now = new Date();
    if (now > signupCodeModel.expiresAt) {
      throw new SignupCodeExpiredException();
    }

    if (signupCodeModel.usedAt) {
      throw new SignupCodeAlreadyUsedException();
    }

    await this.authSignupCodeRepo.setSignupCodeAsUsed(signupCodeModel.id);
  }

  private async saveSignupCode(email: string): Promise<string> {
    const signupCode = this.generateSignupCode();
    const expiresAt = new Date();
    expiresAt.setHours(
      expiresAt.getHours() + this.SIGNUP_CODE_EXPIRES_AT_OFFEST,
    );

    await this.authSignupCodeRepo.upsertSignupCode(
      email,
      signupCode,
      expiresAt,
    );

    return signupCode;
  }

  private async generateAcccessToken(userId: string): Promise<string> {
    return await this.jwtService.signAsync(
      { userId },
      {
        secret: this.configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: `${this.configService.getOrThrow<string>(
          'JWT_ACCESS_TOKEN_EXPIRATION_MS',
        )}ms`,
      },
    );
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    return await this.jwtService.signAsync(
      { userId },
      {
        secret: this.configService.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: `${this.configService.getOrThrow<string>(
          'JWT_REFRESH_TOKEN_EXPIRATION_MS',
        )}ms`,
      },
    );
  }

  private generateSignupCode(): string {
    return crypto
      .randomBytes(this.SIGNUP_CODE_LENGTH)
      .toString('hex')
      .slice(0, this.SIGNUP_CODE_LENGTH)
      .toUpperCase();
  }
}

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
import { UserModel } from 'src/modules/user/models/user.model';
import { UserRefreshTokenService } from 'src/modules/user/service/user-refresh-token.service';
import { UserService } from '../../user/service/user.service';
import { EmailIsNotValidException } from '../internal-exceptions/email-is-not-valid.exception';
import { EmailVerificationCodeAlreadyUsedException } from '../internal-exceptions/email-verification-code-alread-used.exception';
import { EmailVerificationCodeExpiredException } from '../internal-exceptions/email-verification-expired.exception';
import { PasswordsDoNotMatchException } from '../internal-exceptions/passwords-do-not-match.exception';
import { UserIsNotValidatedException } from '../internal-exceptions/user-is-not-validated.exception';
import { EmailAlreadyInUseException } from '../internal-exceptions/user-with-email-already-exists.exception';
import { UserWithUsernameAlreadyExistsException } from '../internal-exceptions/user-with-username-already-exists.exception';
import { EmailVerificationCodeRepository } from '../repository/email-verification-code.repository';

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
    private readonly emailVerificationCodeRepo: EmailVerificationCodeRepository,
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
    const user = await this.userService.findById(userId);
    if (!user.isVerified) {
      this.logger.warn(
        `User ${user.username} is not validated. Sending validation email`,
      );
      await this.verifyEmail(user.email);
      throw new UserIsNotValidatedException();
    }

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

    const signupCodeModel =
      await this.emailVerificationCodeRepo.getEmailVerificationCodeByEmail(
        userModel.email,
      );
    if (!signupCodeModel || !signupCodeModel.usedAt) {
      throw new EmailIsNotValidException();
    }

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

  public async verifyEmailOnSignup(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);
    if (user) {
      throw new EmailAlreadyInUseException();
    }

    await this.verifyEmail(email);
  }

  /**
   * Saves signup code and sends to email
   * @param {string} email
   *
   * @throws {EmailAlreadyInUseException}
   * @throws {DatabaseException}
   * @throws {MailFailedToSendException}
   */
  private async verifyEmail(email: string): Promise<void> {
    const emailVerificationCodeModel =
      await this.emailVerificationCodeRepo.getEmailVerificationCodeByEmail(
        email,
      );
    const now = new Date();
    if (
      emailVerificationCodeModel &&
      !emailVerificationCodeModel.usedAt &&
      emailVerificationCodeModel.expiresAt > now
    ) {
      this.logger.log(
        `Valid signup code already exists for ${email}. Not sending email or creating a new code.`,
      );
      return;
    }

    const emailVerificationCode = await this.saveEmailVerificationCode(email);
    await this.mailService.sendVerificationEmail(email, emailVerificationCode);
  }

  public async confirmEmailVerificationCode(
    code: string,
    email: string,
  ): Promise<void> {
    const signupCodeModel =
      await this.emailVerificationCodeRepo.getEmailVerificationCode(
        code,
        email,
      );
    if (!signupCodeModel) {
      throw new ResourceNotFoundException('Code not found');
    }

    const now = new Date();
    if (now > signupCodeModel.expiresAt) {
      throw new EmailVerificationCodeExpiredException();
    }

    if (signupCodeModel.usedAt) {
      throw new EmailVerificationCodeAlreadyUsedException();
    }

    await this.emailVerificationCodeRepo.setEmailVerificationCodeAsUsed(
      signupCodeModel.id,
    );
  }

  private async saveEmailVerificationCode(email: string): Promise<string> {
    const signupCode = this.generateEmailVerificationCode();
    const expiresAt = new Date();
    expiresAt.setHours(
      expiresAt.getHours() + this.SIGNUP_CODE_EXPIRES_AT_OFFEST,
    );

    await this.emailVerificationCodeRepo.upsertEmailVerificationCode(
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

  private generateEmailVerificationCode(): string {
    return crypto
      .randomBytes(this.SIGNUP_CODE_LENGTH)
      .toString('hex')
      .slice(0, this.SIGNUP_CODE_LENGTH)
      .toUpperCase();
  }
}

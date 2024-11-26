import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { BaseException } from 'src/common/internal-exceptions/base.exception';
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
import { PasswordsDoNotMatchException } from '../internal-exceptions/passwords-do-not-match.exception';
import { UserIsNotValidatedException } from '../internal-exceptions/user-is-not-validated.exception';
import { EmailAlreadyInUseException } from '../internal-exceptions/user-with-email-already-exists.exception';
import { UserWithUsernameAlreadyExistsException } from '../internal-exceptions/user-with-username-already-exists.exception';
import { EmailVerificationCodeService } from './email-verification-code.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private userRefreshTokenService: UserRefreshTokenService,
    private jwtService: JwtService,
    private logger: LoggerServiceV2,
    private configService: ConfigService,
    private readonly mailService: MailService,
    private readonly emailVerificationCodeService: EmailVerificationCodeService,
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
  ): Promise<{ accessToken: string; refreshToken: string; user: UserModel }> {
    const user = await this.userService.findById(userId);
    if (!user.isVerified) {
      this.logger.warn(
        `User ${user.username} is not validated. Sending verification email`,
      );
      await this.generateEmailVerificationCodeAndSendEmail(user.email);
      throw new UserIsNotValidatedException(user.email);
    }
    const { accessToken, refreshToken } =
      await this.getNewAccessAndRefreshToken(userId, deviceId);
    return { accessToken, refreshToken, user };
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

    const emailVerificationCodeModel =
      await this.emailVerificationCodeService.getEmailVerificationCodeByEmail(
        userModel.email,
      );
    if (!emailVerificationCodeModel || !emailVerificationCodeModel.usedAt) {
      throw new EmailIsNotValidException();
    }

    const createdUser = await this.userService.create(userModel);

    const { accessToken, refreshToken } =
      await this.getNewAccessAndRefreshToken(createdUser.id, deviceId);

    const user = await this.userService.findById(createdUser.id);
    return { accessToken, refreshToken, user };
  }

  public async refreshToken(
    userId: string,
    deviceId: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: UserModel }> {
    const user = await this.userService.findById(userId);
    const { accessToken, refreshToken } =
      await this.getNewAccessAndRefreshToken(userId, deviceId);
    return { accessToken, refreshToken, user };
  }

  public async verifyEmailOnSignup(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);
    if (user) {
      throw new EmailAlreadyInUseException();
    }

    await this.generateEmailVerificationCodeAndSendEmail(email);
  }

  public async confirmEmailVerificationCode(
    code: string,
    email: string,
  ): Promise<void> {
    await this.emailVerificationCodeService.confirmEmailVerificationCodeIsValidAndSetAsUsed(
      code,
      email,
    );
    const user = await this.userService.findByEmail(email);
    if (user) {
      this.logger.log(
        `User ${email} verified email in login process. Setting user as verified`,
      );
      await this.userService.verifyUser(email);
    }
  }

  public async sendForgotPasswordEmail(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      this.logger.warn('No user with email. Not sending email');
      return;
    }

    const resetToken = this.jwtService.sign(
      {
        email,
      },
      {
        secret: this.configService.getOrThrow('RESET_PASSWORD_TOKEN_SECRET'),
        expiresIn: this.configService.getOrThrow(
          'RESET_PASSWORD_TOKEN_EXPIRATION_MS',
        ),
      },
    );

    await this.mailService.sendForgotPasswordEmail(email, resetToken);
  }

  public async resetPassword(
    token: string,
    password: string,
    confirmPassword: string,
  ): Promise<void> {
    let emailAddress: string;
    try {
      const { email } = this.jwtService.verify(token, {
        secret: this.configService.getOrThrow('RESET_PASSWORD_TOKEN_SECRET'),
      });
      emailAddress = email;
    } catch (e) {
      throw new BaseException(
        'Email has expired. Send another forgot password email',
      );
    }
    const user = await this.userService.findByEmail(emailAddress);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (password !== confirmPassword) {
      throw new PasswordsDoNotMatchException();
    }

    const hashedPassword = await generateHashPassword(password);

    await this.userService.resetPassword(user.id, hashedPassword);
  }

  /**
   * Saves signup code and sends to email
   * @param {string} email
   *
   * @throws {EmailAlreadyInUseException}
   * @throws {DatabaseException}
   * @throws {MailFailedToSendException}
   */
  private async generateEmailVerificationCodeAndSendEmail(
    email: string,
  ): Promise<void> {
    const emailVerificationCodeModel =
      await this.emailVerificationCodeService.getEmailVerificationCodeByEmail(
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

    const emailVerificationCode =
      await this.emailVerificationCodeService.saveEmailVerificationCode(email);
    await this.mailService.sendVerificationEmail(email, emailVerificationCode);
  }

  private async getNewAccessAndRefreshToken(userId: string, deviceId: string) {
    const accessToken = await this.generateAcccessToken(userId);
    const refreshToken = await this.generateRefreshToken(userId);

    let hashedRefreshToken: string;
    try {
      hashedRefreshToken = await generateHashPassword(refreshToken);
    } catch (e) {
      this.logger.error(`Error hashing refresh token for user ${userId}`, e);
      throw e;
    }

    await this.userRefreshTokenService.upsertRefreshToken(
      userId,
      hashedRefreshToken,
      deviceId,
    );

    return { accessToken, refreshToken };
  }

  private async generateAcccessToken(userId: string): Promise<string> {
    try {
      return await this.jwtService.signAsync(
        { userId },
        {
          secret: this.configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
          expiresIn: `${this.configService.getOrThrow<string>(
            'JWT_ACCESS_TOKEN_EXPIRATION_MS',
          )}ms`,
        },
      );
    } catch (e) {
      this.logger.error(`Error generating access token for user ${userId}`, e);
      throw e;
    }
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    try {
      return await this.jwtService.signAsync(
        { userId },
        {
          secret: this.configService.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
          expiresIn: `${this.configService.getOrThrow<string>(
            'JWT_REFRESH_TOKEN_EXPIRATION_MS',
          )}ms`,
        },
      );
    } catch (e) {
      this.logger.error(`Error generating refresh token for user ${userId}`, e);
      throw e;
    }
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { BaseException } from 'src/common/internal-exceptions/base.exception';
import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { LoggerService } from 'src/common/logger/logger.service';
import { generateHashPassword } from 'src/modules/auth/helpers/password-helper';
import { MailService } from 'src/modules/mail/mail.service';
import { InsertUserModel } from 'src/modules/user/models/insert-user.model';
import { EmailIsNotValidException } from '../internal-exceptions/email-is-not-valid.exception';
import { PasswordsDoNotMatchException } from '../internal-exceptions/passwords-do-not-match.exception';
import { EmailAlreadyInUseException } from '../internal-exceptions/user-with-email-already-exists.exception';
import { UserWithUsernameAlreadyExistsException } from '../internal-exceptions/user-with-username-already-exists.exception';
import { UserRepository } from '../repository/user.repository';
import { AuthTokenService } from './auth-token-service';
import { EmailVerificationCodeService } from './email-verification-code.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private logger: LoggerService,
    private configService: ConfigService,
    private readonly mailService: MailService,
    private readonly emailVerificationCodeService: EmailVerificationCodeService,
    private readonly userRepo: UserRepository,
    private readonly authTokenService: AuthTokenService,
  ) {
    this.logger.setContext(AuthService.name);
  }

  public async login(
    userId: string,
    deviceId: string,
  ): Promise<{ accessToken: string; refreshToken: string; username: string }> {
    const user = await this.userRepo.getUserById(userId);
    if (!user) {
      throw new ResourceNotFoundException('User is not foudn');
    }

    const { accessToken, refreshToken } =
      await this.authTokenService.generateAccessAndRefreshToken(
        userId,
        deviceId,
      );
    return { accessToken, refreshToken, username: user.username };
  }

  public async logout(userId: string, deviceId: string) {
    await this.authTokenService.deleteRefreshToken(userId, deviceId);
  }

  public async signup(
    userModel: InsertUserModel,
    confirmPassword: string,
    deviceId: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    username: string;
  }> {
    if (await this.userRepo.getUserByUsername(userModel.username)) {
      throw new UserWithUsernameAlreadyExistsException();
    }
    if (await this.userRepo.getUserByEmail(userModel.email)) {
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

    const createdUser = await this.userRepo.createUser(userModel);

    const { accessToken, refreshToken } =
      await this.authTokenService.generateAccessAndRefreshToken(
        createdUser.id,
        deviceId,
      );

    return { accessToken, refreshToken, username: createdUser.username };
  }

  public async refreshToken(
    userId: string,
    deviceId: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    username: string;
  }> {
    const user = await this.userRepo.getUserById(userId);
    if (!user) {
      throw new ResourceNotFoundException('User not found');
    }
    const { accessToken, refreshToken } =
      await this.authTokenService.generateAccessAndRefreshToken(
        userId,
        deviceId,
      );
    return { accessToken, refreshToken, username: user.username };
  }

  public async verifyEmailOnSignup(email: string): Promise<void> {
    const user = await this.userRepo.getUserByEmail(email);
    if (user) {
      throw new EmailAlreadyInUseException();
    }

    const emailVerificationCode =
      await this.emailVerificationCodeService.generateAndSaveEmailVerificationCode(
        email,
      );

    if (emailVerificationCode) {
      await this.mailService.sendVerificationEmail(
        email,
        emailVerificationCode,
      );
    }
  }

  public async confirmEmailVerificationCode(
    code: string,
    email: string,
  ): Promise<void> {
    await this.emailVerificationCodeService.confirmEmailVerificationCodeIsValidAndSetAsUsed(
      code,
      email,
    );
  }

  public async sendForgotPasswordEmail(email: string): Promise<void> {
    const user = await this.userRepo.getUserByEmail(email);
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
    const user = await this.userRepo.getUserByEmail(emailAddress);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (password !== confirmPassword) {
      throw new PasswordsDoNotMatchException();
    }

    const hashedPassword = await generateHashPassword(password);

    await this.userRepo.resetPassword(user.id, hashedPassword);
  }
}

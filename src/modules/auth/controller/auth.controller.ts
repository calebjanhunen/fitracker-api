import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Headers,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { InsertUserModel } from 'src/modules/user/models/insert-user.model';
import { AuthenticationResponseDto } from '../dto/authentication-response.dto';
import { ConfirmEmailVerificationCodeDto } from '../dto/confirm-email-verification-code.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import UserSignupDto from '../dto/user-signup-dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { JwtRefreshAuthGuard } from '../guards/jwt-refresh-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { EmailVerificationException } from '../internal-exceptions/email-verification.exception';
import { SignupValidationException } from '../internal-exceptions/signup-validation.exception';
import { UserIsNotValidatedException } from '../internal-exceptions/user-is-not-validated.exception';
import { EmailAlreadyInUseException } from '../internal-exceptions/user-with-email-already-exists.exception';
import { AuthService } from '../service/auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  public async login(
    @CurrentUser() userId: string,
    @Headers('x-device-id') deviceId: string,
  ): Promise<AuthenticationResponseDto> {
    try {
      const { accessToken, refreshToken, username } =
        await this.authService.login(userId, deviceId);
      return {
        accessToken,
        refreshToken,
        username,
      };
    } catch (e) {
      if (e instanceof UserIsNotValidatedException) {
        throw new ForbiddenException(e);
      }
      throw new InternalServerErrorException();
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logout(
    @CurrentUser() userId: string,
    @Headers('x-device-id') deviceId: string,
  ): Promise<void> {
    await this.authService.logout(userId, deviceId);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  public async refreshToken(
    @CurrentUser() userId: string,
    @Headers('x-device-id') deviceId: string,
  ): Promise<AuthenticationResponseDto> {
    try {
      const { accessToken, refreshToken, username } =
        await this.authService.refreshToken(userId, deviceId);
      return {
        accessToken,
        refreshToken,
        username,
      };
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  @Post('signup')
  public async signup(
    @Body() signupDto: UserSignupDto,
    @Headers('x-device-id') deviceId: string,
  ): Promise<AuthenticationResponseDto> {
    try {
      const model = this.mapper.map(signupDto, UserSignupDto, InsertUserModel);
      const { accessToken, refreshToken, username } =
        await this.authService.signup(
          model,
          signupDto.confirmPassword,
          deviceId,
        );
      return {
        accessToken,
        refreshToken,
        username,
      };
    } catch (e) {
      if (
        e instanceof SignupValidationException ||
        e instanceof EmailVerificationException
      ) {
        throw new ConflictException(e);
      }
      throw new InternalServerErrorException();
    }
  }

  @Post('verify-email-on-signup')
  public async verifyEmailOnSignup(
    @Body() verifyEmailDto: VerifyEmailDto,
  ): Promise<void> {
    try {
      await this.authService.verifyEmailOnSignup(verifyEmailDto.email);
    } catch (e) {
      if (e instanceof EmailAlreadyInUseException) {
        throw new ConflictException(e);
      }
      throw new InternalServerErrorException(e);
    }
  }

  @Post('confirm-email-verification-code')
  public async confirmEmailVerificationCode(
    @Body() confirmEmailVerificationCodeDto: ConfirmEmailVerificationCodeDto,
  ): Promise<void> {
    try {
      const { code, email } = confirmEmailVerificationCodeDto;
      await this.authService.confirmEmailVerificationCode(code, email);
    } catch (e) {
      if (e instanceof ResourceNotFoundException) {
        throw new ConflictException('Code is not valid');
      }
      if (e instanceof EmailVerificationException) {
        throw new ConflictException(e);
      }
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post('forgotPassword')
  public async forgotPassword(
    @Body() forgotPasswordDto: VerifyEmailDto,
  ): Promise<void> {
    try {
      await this.authService.sendForgotPasswordEmail(forgotPasswordDto.email);
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  @Patch('resetPassword')
  public async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    try {
      const { password, confirmPassword, token } = resetPasswordDto;
      await this.authService.resetPassword(token, password, confirmPassword);
    } catch (e) {
      if (e instanceof ResourceNotFoundException) {
        throw new NotFoundException(e);
      }
      throw new InternalServerErrorException(e);
    }
  }
}

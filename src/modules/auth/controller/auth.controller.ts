import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Body,
  ConflictException,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { UserResponseDto } from 'src/modules/user/dtos/user-response.dto';
import { InsertUserModel } from 'src/modules/user/models/insert-user.model';
import { UserModel } from 'src/modules/user/models/user.model';
import { AuthenticationResponseDto } from '../dto/authentication-response.dto';
import { ConfirmSignupCodeDto } from '../dto/confirm-signup-code.dto';
import { SignupResponseDto } from '../dto/signup-response.dto';
import UserSignupDto from '../dto/user-signup-dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { JwtRefreshAuthGuard } from '../guards/jwt-refresh-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { SignupCodeException } from '../internal-exceptions/signup-code.exception';
import { SignupValidationException } from '../internal-exceptions/signup-validation.exception';
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
      const { accessToken, refreshToken } = await this.authService.login(
        userId,
        deviceId,
      );
      return {
        accessToken,
        refreshToken,
      };
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  @Post('/logout')
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
      const { accessToken, refreshToken } = await this.authService.login(
        userId,
        deviceId,
      );
      return {
        accessToken,
        refreshToken,
      };
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  @Post('signup')
  public async signup(
    @Body() signupDto: UserSignupDto,
    @Headers('x-device-id') deviceId: string,
  ): Promise<SignupResponseDto> {
    try {
      const model = this.mapper.map(signupDto, UserSignupDto, InsertUserModel);
      const { accessToken, refreshToken, user } = await this.authService.signup(
        model,
        signupDto.confirmPassword,
        deviceId,
      );
      return {
        accessToken,
        refreshToken,
        user: this.mapper.map(user, UserModel, UserResponseDto),
      };
    } catch (e) {
      if (e instanceof SignupValidationException) {
        throw new ConflictException(e);
      }
      throw new InternalServerErrorException();
    }
  }

  @Post('verify-email')
  public async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto,
  ): Promise<void> {
    try {
      await this.authService.verifyEmail(verifyEmailDto.email);
    } catch (e) {
      if (e instanceof EmailAlreadyInUseException) {
        throw new ConflictException(e);
      }
      throw new InternalServerErrorException(e);
    }
  }

  @Post('confirm-signup-code')
  public async confirmSignupCode(
    @Body() confirmSignupCodeDto: ConfirmSignupCodeDto,
  ): Promise<void> {
    try {
      const { code, email } = confirmSignupCodeDto;
      await this.authService.confirmSignupCode(code, email);
    } catch (e) {
      if (e instanceof ResourceNotFoundException) {
        throw new ConflictException('Code is not valid');
      }
      if (e instanceof SignupCodeException) {
        throw new ConflictException(e);
      }
      throw new InternalServerErrorException(e.message);
    }
  }
}

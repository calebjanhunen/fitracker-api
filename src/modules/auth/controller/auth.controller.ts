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
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { InsertUserModel } from 'src/modules/user/models/insert-user.model';
import { AuthenticationResponseDto } from '../dto/authentication-response.dto';
import { ConfirmSignupCodeDto } from '../dto/confirm-signup-code.dto';
import { SendSignupCodeDto } from '../dto/send-signup-code.dto';
import UserSignupDto from '../dto/user-signup-dto';
import { JwtRefreshAuthGuard } from '../guards/jwt-refresh-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { SignupCodeException } from '../internal-exceptions/signup-code.exception';
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
  ): Promise<AuthenticationResponseDto> {
    try {
      const model = this.mapper.map(signupDto, UserSignupDto, InsertUserModel);
      const { accessToken, refreshToken } = await this.authService.signup(
        model,
        signupDto.confirmPassword,
        deviceId,
      );
      return { accessToken, refreshToken };
    } catch (e) {
      throw new ConflictException(e.message);
    }
  }

  @Post('send-signup-code')
  public async sendSignupCodeToEmail(
    @Body() checkEmailDto: SendSignupCodeDto,
  ): Promise<void> {
    try {
      await this.authService.sendSignupCodeToEmail(checkEmailDto.email);
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
        throw new NotFoundException(e);
      }
      if (e instanceof SignupCodeException) {
        throw new ConflictException(e);
      }
      throw new InternalServerErrorException(e.message);
    }
  }
}

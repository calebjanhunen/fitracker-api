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
import { InsertUserModel } from 'src/modules/user/models/insert-user.model';
import { AuthenticationResponseDto } from '../dto/authentication-response.dto';
import { CheckEmailRequestDto } from '../dto/check-email-request.dto';
import { CheckEmailResponseDto } from '../dto/check-email-response.dto';
import UserSignupDto from '../dto/user-signup-dto';
import { JwtRefreshAuthGuard } from '../guards/jwt-refresh-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
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

  @Post('check-email')
  public async checkEmail(
    @Body() checkEmailDto: CheckEmailRequestDto,
  ): Promise<CheckEmailResponseDto> {
    try {
      const result = await this.authService.checkIfEmailIsAvailable(
        checkEmailDto.email,
      );
      return {
        isAvailable: result.isAvailable,
        message: result.message,
      };
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }
}

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
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from 'src/common/decorators';
import { InsertUserModel } from 'src/modules/user/models/insert-user.model';
import { LoginResponseDto } from '../dto/login-response.dto';
import UserSignupDto from '../dto/user-signup-dto';
import { JwtRefreshAuthGuard } from '../guards/jwt-refresh-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AuthService } from '../service/auth.service';

@Controller('auth')
export class AuthController {
  private authService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  public async login(
    @CurrentUser() userId: string,
    @Headers('x-device-id') deviceId: string,
  ): Promise<LoginResponseDto> {
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
  ): Promise<LoginResponseDto> {
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
  ): Promise<LoginResponseDto> {
    try {
      const model = plainToInstance(InsertUserModel, signupDto);
      const accessToken = await this.authService.signup(
        model,
        signupDto.confirmPassword,
      );
      return plainToInstance(LoginResponseDto, { accessToken });
    } catch (e) {
      throw new ConflictException(e.message);
    }
  }
}

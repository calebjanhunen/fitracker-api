import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { LoginResponseDto } from '../dto/login-response.dto';
import { UserLoginDto } from '../dto/user-signin.dto';
import { AuthService } from '../service/auth.service';

@Controller('auth')
export class AuthController {
  private authService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  @Post('login')
  async login(@Body() userLoginDto: UserLoginDto): Promise<LoginResponseDto> {
    const { username, password } = userLoginDto;
    try {
      const accessToken = await this.authService.signIn(username, password);
      const response = plainToInstance(LoginResponseDto, { accessToken });
      return response;
    } catch (error) {
      throw new HttpException('Login failed', HttpStatus.CONFLICT);
    }
  }
}

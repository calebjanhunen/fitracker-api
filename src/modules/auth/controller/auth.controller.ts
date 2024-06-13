import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { UserLoginDto } from '../dto/user-signin.dto';
import { AuthService } from '../service/auth.service';
import { LoginResponseDto } from '../dto/login-response.dto';

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
      const result = await this.authService.signIn(username, password);
      return result;
    } catch (error) {
      throw new HttpException('Login failed', HttpStatus.CONFLICT);
    }
  }
}

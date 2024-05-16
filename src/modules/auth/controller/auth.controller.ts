import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { UserLoginDto } from '../dto/user-signin.dto';
import { AuthService } from '../service/auth.service';

@Controller('auth')
export class AuthController {
  private authService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  @Post('login')
  async login(@Body() userLoginDto: UserLoginDto) {
    const { username, password } = userLoginDto;
    try {
      const accessToken = await this.authService.signIn(username, password);
      return { accessToken };
    } catch (error) {
      throw new HttpException('Login failed', HttpStatus.CONFLICT);
    }
  }
}

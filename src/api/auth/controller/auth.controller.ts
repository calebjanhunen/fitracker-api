import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { NotFoundError } from 'rxjs';
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
      if (error instanceof NotFoundError) {
        return {
          message: 'User not found',
          status: 404,
        };
      }
      if (error instanceof UnauthorizedException) {
        return {
          message: 'Invalid login credentials',
          status: 401,
        };
      }
      return {
        message: error.message,
        status: 500,
      };
    }
  }
}

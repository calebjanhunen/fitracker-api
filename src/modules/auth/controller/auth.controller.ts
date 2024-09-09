import {
  Body,
  ConflictException,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { InsertUserModel } from 'src/modules/user/models/insert-user.model';
import { LoginResponseDto } from '../dto/login-response.dto';
import { UserLoginDto } from '../dto/user-signin.dto';
import UserSignupDto from '../dto/user-signup-dto';
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

import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { comparePasswords } from 'src/modules/auth/helpers/password-helper';
import { UserService } from '../../user/service/user.service';
import { LoginResponseDto } from '../dto/login-response.dto';

@Injectable()
export class AuthService {
  private userService;
  private jwtService;

  constructor(userService: UserService, jwtService: JwtService) {
    this.userService = userService;
    this.jwtService = jwtService;
  }

  async signIn(username: string, password: string): Promise<LoginResponseDto> {
    try {
      const user = await this.userService.findByUsername(username);
      if (!user) {
        throw new NotFoundException();
      }

      const doPasswordsMatch = await comparePasswords(password, user.password);

      if (!doPasswordsMatch) {
        throw new UnauthorizedException();
      }

      const accessToken = await this.jwtService.signAsync({
        id: user.id,
        username: user.username,
      });

      return {
        accessToken,
        user: {
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}

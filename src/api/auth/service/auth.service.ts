import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { comparePasswords } from 'src/api/utils/helpers/password-helper';
import { UserService } from '../../../api/user/service/user.service';

@Injectable()
export class AuthService {
  private userService;
  private jwtService;

  constructor(userService: UserService, jwtService: JwtService) {
    this.userService = userService;
    this.jwtService = jwtService;
  }

  async signIn(username: string, password: string): Promise<string> {
    try {
      const user = await this.userService.getByUsername(username);
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

      return accessToken;
    } catch (error) {
      throw error;
    }
  }
}

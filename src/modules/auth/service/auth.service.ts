import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { comparePasswords } from 'src/modules/auth/helpers/password-helper';
import { UserService } from '../../user/service/user.service';

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
      const user = await this.userService.findByUsername(username);
      if (!user) {
        throw new ResourceNotFoundException(
          `User not found with username: ${username}`,
        );
      }

      const doPasswordsMatch = await comparePasswords(password, user.password);

      if (!doPasswordsMatch) {
        throw new Error();
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

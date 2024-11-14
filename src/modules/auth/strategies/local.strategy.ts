import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { PasswordsDoNotMatchException } from '../internal-exceptions/passwords-do-not-match.exception';
import { AuthService } from '../service/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  public async validate(username: string, password: string) {
    try {
      return await this.authService.verifyUser(username, password);
    } catch (e) {
      if (
        e instanceof ResourceNotFoundException ||
        e instanceof PasswordsDoNotMatchException
      ) {
        throw new UnauthorizedException('Invalid username or password');
      }
      throw new UnauthorizedException(e);
    }
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { LoggerService } from 'src/common/logger/logger.service';
import { PasswordsDoNotMatchException } from '../internal-exceptions/passwords-do-not-match.exception';
import { AuthStrategyService } from '../service/auth-strategy.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authStrategyService: AuthStrategyService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(LocalStrategy.name);
  }

  public async validate(username: string, password: string) {
    try {
      return await this.authStrategyService.verifyUser(username, password);
    } catch (e) {
      this.logger.warn(`${username} failed login attempt`, { username });
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

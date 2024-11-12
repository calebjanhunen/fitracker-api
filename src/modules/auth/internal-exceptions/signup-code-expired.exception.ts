import { SignupCodeException } from './signup-code.exception';

export class SignupCodeExpiredException extends SignupCodeException {
  constructor() {
    super('Code is already expired');
  }
}

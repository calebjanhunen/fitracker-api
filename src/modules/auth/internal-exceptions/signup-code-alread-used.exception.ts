import { SignupCodeException } from './signup-code.exception';

export class SignupCodeAlreadyUsedException extends SignupCodeException {
  constructor() {
    super('Code has already been used');
  }
}

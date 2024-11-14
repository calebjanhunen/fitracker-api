import { SignupValidationException } from './signup-validation.exception';

export class PasswordsDoNotMatchException extends SignupValidationException {
  constructor() {
    super('Passwords do not match.');
  }
}

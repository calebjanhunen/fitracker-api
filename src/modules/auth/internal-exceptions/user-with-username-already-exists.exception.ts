import { SignupValidationException } from './signup-validation.exception';

export class UserWithUsernameAlreadyExistsException extends SignupValidationException {
  constructor() {
    super('Username is taken.');
  }
}

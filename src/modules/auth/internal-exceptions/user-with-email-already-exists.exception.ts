import { SignupValidationException } from './signup-validation.exception';

export class EmailAlreadyInUseException extends SignupValidationException {
  constructor() {
    super('Email is already in use');
  }
}

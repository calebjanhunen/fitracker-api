import { SignupCodeException } from './signup-code.exception';
export class EmailIsNotValidException extends SignupCodeException {
  constructor() {
    super('Email is not valid');
  }
}

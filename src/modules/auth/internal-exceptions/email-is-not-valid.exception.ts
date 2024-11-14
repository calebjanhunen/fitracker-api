import { SignupCodeException } from './email-verification.exception';
export class EmailIsNotValidException extends SignupCodeException {
  constructor() {
    super('Email is not valid');
  }
}

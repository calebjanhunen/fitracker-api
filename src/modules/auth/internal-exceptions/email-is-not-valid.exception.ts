import { EmailVerificationException } from './email-verification.exception';

export class EmailIsNotValidException extends EmailVerificationException {
  constructor() {
    super('Email is not valid');
  }
}

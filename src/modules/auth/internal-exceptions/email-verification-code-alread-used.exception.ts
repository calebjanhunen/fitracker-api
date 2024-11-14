import { EmailVerificationException } from './email-verification.exception';

export class EmailVerificationCodeAlreadyUsedException extends EmailVerificationException {
  constructor() {
    super('Code has already been used');
  }
}

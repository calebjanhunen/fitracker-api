import { EmailVerificationException } from './email-verification.exception';

export class EmailVerificationCodeExpiredException extends EmailVerificationException {
  constructor() {
    super('Code is expired');
  }
}

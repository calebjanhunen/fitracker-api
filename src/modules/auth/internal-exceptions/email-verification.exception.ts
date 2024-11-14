import { BaseException } from 'src/common/internal-exceptions/base.exception';

export class EmailVerificationException extends BaseException {
  constructor(message: string) {
    super(message);
  }
}

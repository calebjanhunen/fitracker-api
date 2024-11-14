import { BaseException } from 'src/common/internal-exceptions/base.exception';

export class SignupCodeException extends BaseException {
  constructor(message: string) {
    super(message);
  }
}

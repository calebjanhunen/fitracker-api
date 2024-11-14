import { BaseException } from 'src/common/internal-exceptions/base.exception';

export class SignupValidationException extends BaseException {
  constructor(message: string) {
    super(message);
  }
}

import { BaseException } from 'src/common/internal-exceptions/base.exception';

export class UserIsNotValidatedException extends BaseException {
  constructor(email: string) {
    super(email);
  }
}

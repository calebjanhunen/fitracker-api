import { BaseException } from 'src/common/internal-exceptions/base.exception';

export class PasswordsDoNotMatchException extends BaseException {
  constructor() {
    super('Passwords do not match.');
  }
}

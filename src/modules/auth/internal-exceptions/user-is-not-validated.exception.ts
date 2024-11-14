import { BaseException } from 'src/common/internal-exceptions/base.exception';

export class UserIsNotValidatedException extends BaseException {
  constructor() {
    super('User is not validated');
  }
}

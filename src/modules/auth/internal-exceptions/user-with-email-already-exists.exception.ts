import { BaseException } from 'src/common/internal-exceptions/base.exception';

export class UserWithEmailAlreadyExistsException extends BaseException {
  constructor(email: string) {
    super(`User with email ${email} already exists.`);
  }
}

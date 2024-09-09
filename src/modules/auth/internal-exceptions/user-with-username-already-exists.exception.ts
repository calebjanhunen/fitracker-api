import { BaseException } from 'src/common/internal-exceptions/base.exception';

export class UserWithUsernameAlreadyExistsException extends BaseException {
  constructor(username: string) {
    super(`User with username ${username} already exists.`);
  }
}

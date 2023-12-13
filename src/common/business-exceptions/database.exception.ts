import { BaseException } from './base.exception';

export class DatabaseException extends BaseException {
  constructor(message: string) {
    super(message);
  }
}

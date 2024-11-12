import { BaseException } from 'src/common/internal-exceptions/base.exception';

export class EmailAlreadyInUseException extends BaseException {
  constructor() {
    super('Email is already in use');
  }
}

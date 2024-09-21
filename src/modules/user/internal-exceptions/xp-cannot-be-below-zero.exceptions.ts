import { BaseException } from 'src/common/internal-exceptions/base.exception';

export class XpCannotBeBelowZeroException extends BaseException {
  constructor() {
    super('XP cannot be below 0.');
  }
}

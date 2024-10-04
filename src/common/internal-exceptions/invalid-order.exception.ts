import { BaseException } from 'src/common/internal-exceptions/base.exception';

export class InvalidOrderException extends BaseException {
  constructor(type: 'set' | 'exercise') {
    if (type === 'exercise') {
      super(
        'Invalid exercise order: The order of exercises must start at 1 and increase sequentially',
      );
    } else {
      super(
        'Invalid set order: The order of sets must start at 1 and increase sequentially',
      );
    }
  }
}

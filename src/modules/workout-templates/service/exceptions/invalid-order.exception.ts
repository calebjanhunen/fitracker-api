import { BaseException } from 'src/common/internal-exceptions/base.exception';

export class InvalidOrderException extends BaseException {
  constructor(type: 'Exercise' | 'Set', order: number, index: number) {
    super(
      `${type} order should be sequential starting from 1. Found order: ${order} at index ${index}`,
    );
  }
}

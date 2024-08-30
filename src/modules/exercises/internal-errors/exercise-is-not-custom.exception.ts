import { BaseException } from 'src/common/internal-exceptions/base.exception';

export class ExerciseIsNotCustomException extends BaseException {
  constructor() {
    super('Cannot update or delete a default exercise');
  }
}

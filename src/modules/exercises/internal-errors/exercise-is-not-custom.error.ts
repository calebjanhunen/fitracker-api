import { BaseException } from 'src/common/internal-exceptions/base.exception';

export class ExerciseIsNotCustomError extends BaseException {
  constructor() {
    super('Cannot update or delete a default exercise');
  }
}

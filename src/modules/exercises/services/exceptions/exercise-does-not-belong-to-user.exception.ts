import { BaseException } from 'src/common/internal-exceptions/base.exception';

export class ExerciseDoesNotBelongToUser extends BaseException {
  constructor() {
    super('Exercise does not belong to the user in the request');
  }
}

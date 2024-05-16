import { BaseException } from 'src/common/business-exceptions/base.exception';

export class ExerciseDoesNotBelongToUser extends BaseException {
  constructor() {
    super('Exercuse does not belong to the user in the request');
  }
}

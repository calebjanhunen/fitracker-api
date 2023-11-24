import { BaseError } from './base.error';

export class ExerciseIsNotCustomError extends BaseError {
  constructor() {
    super('Cannot update or delete a default exercise');
  }
}

import { BaseError } from './base.error';

export class ExerciseIsNotCustomError extends BaseError {
  constructor() {
    super('Cannot delete a default exercise');
  }
}

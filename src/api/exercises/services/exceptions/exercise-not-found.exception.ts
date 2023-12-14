import { ResourceNotFoundException } from 'src/common/business-exceptions/resource-not-found.exception';

export class ExerciseNotFoundException extends ResourceNotFoundException {
  constructor() {
    super('Exercise not found using the provided id and userId');
  }
}

import { ResourceNotFoundException } from 'src/common/business-exceptions/resource-not-found.exception';

export class WorkoutNotFoundException extends ResourceNotFoundException {
  constructor() {
    super('Could not find workout using the provided id and user');
  }
}

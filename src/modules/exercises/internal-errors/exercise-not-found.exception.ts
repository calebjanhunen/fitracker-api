import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';

export class ExerciseNotFoundException extends ResourceNotFoundException {
  constructor(id: string) {
    super(`Exercise not found with id: ${id}`);
  }
}

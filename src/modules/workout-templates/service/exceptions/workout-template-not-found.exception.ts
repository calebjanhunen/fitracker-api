import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';

export class WorkoutTemplateNotFoundException extends ResourceNotFoundException {
  constructor(id: string) {
    super(`Could not find workout template with id: ${id}`);
  }
}

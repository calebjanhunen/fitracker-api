import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';

export class ExerciseNotFoundException extends ResourceNotFoundException {
  constructor(id: string, isVariation?: boolean) {
    super(
      `Exercise${isVariation ? ' variation' : ''} not found with id: ${id}`,
    );
  }
}

import { DatabaseException } from 'src/common/internal-exceptions/database.exception';

export class CouldNotUpdateWorkoutTemplateException extends DatabaseException {
  constructor(id: string) {
    super(`Could not update workout template with id: ${id}`);
  }
}

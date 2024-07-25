import { DatabaseException } from 'src/common/internal-exceptions/database.exception';

export class CouldNotDeleteWorkoutTemplateException extends DatabaseException {
  constructor(message: string) {
    super(message);
  }
}

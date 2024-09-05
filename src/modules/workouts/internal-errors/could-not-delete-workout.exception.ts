import { DatabaseException } from 'src/common/internal-exceptions/database.exception';

export class CouldNotDeleteWorkoutException extends DatabaseException {
  constructor(message: string) {
    super(`Error encountered when deleting workout: ${message}`);
  }
}

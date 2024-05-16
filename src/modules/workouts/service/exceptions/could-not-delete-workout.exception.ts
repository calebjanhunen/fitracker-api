import { DatabaseException } from 'src/common/internal-exceptions/database.exception';

export class CouldNotDeleteWorkoutException extends DatabaseException {
  constructor() {
    super('Error encountered when deleting working');
  }
}

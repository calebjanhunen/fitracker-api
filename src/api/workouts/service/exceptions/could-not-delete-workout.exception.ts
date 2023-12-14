import { DatabaseException } from 'src/common/business-exceptions/database.exception';

export class CouldNotDeleteWorkoutException extends DatabaseException {
  constructor() {
    super('Error encountered when deleting working');
  }
}

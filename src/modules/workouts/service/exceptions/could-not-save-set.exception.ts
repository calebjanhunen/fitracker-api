import { DatabaseException } from 'src/common/internal-exceptions/database.exception';

export class CouldNotSaveSetException extends DatabaseException {
  constructor() {
    super('Error saving sets');
  }
}

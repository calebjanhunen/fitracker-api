import { DatabaseException } from 'src/common/business-exceptions/database.exception';

export class CouldNotSaveSetException extends DatabaseException {
  constructor() {
    super('Error saving sets');
  }
}

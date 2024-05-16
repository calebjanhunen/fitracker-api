import { DatabaseException } from 'src/common/business-exceptions/database.exception';

export class CouldNotSaveWorkoutException extends DatabaseException {
  constructor(workoutName: string) {
    super(`Error saving workout: ${workoutName}`);
  }
}

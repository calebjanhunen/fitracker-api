import { DatabaseException } from 'src/common/internal-exceptions/database.exception';

export class CouldNotSaveWorkoutException extends DatabaseException {
  constructor(workoutName: string) {
    super(`Error saving workout: ${workoutName}`);
  }
}

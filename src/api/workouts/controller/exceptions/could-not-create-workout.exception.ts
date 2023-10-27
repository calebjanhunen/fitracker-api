import { ConflictException } from '@nestjs/common';

export class CouldNotCreateWorkoutException extends ConflictException {
  constructor() {
    super('Could not create workout.');
  }
}

import { NotFoundException } from '@nestjs/common';

export class CouldNotFindWorkoutException extends NotFoundException {
  constructor() {
    super('Could not find requested workout using the provided id.');
  }
}

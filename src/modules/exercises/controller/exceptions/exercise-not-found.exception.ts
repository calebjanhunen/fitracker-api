import { NotFoundException } from '@nestjs/common';

export class ExerciseNotFoundException extends NotFoundException {
  constructor() {
    super('Requested exercise was not found using the provided id');
  }
}

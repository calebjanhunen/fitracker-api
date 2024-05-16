import { InternalServerErrorException } from '@nestjs/common';

export class CouldNotDeleteExerciseException extends InternalServerErrorException {
  constructor() {
    super('Could not delete exercise using the given id');
  }
}

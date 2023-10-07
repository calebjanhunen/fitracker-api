import { Injectable } from '@nestjs/common';

@Injectable()
export default class ExercisesService {
  getAllExercises(): string {
    return 'All Exercises';
  }
}

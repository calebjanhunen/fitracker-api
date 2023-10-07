import { Controller, Get } from '@nestjs/common';
import ExercisesService from './exercises.service';

@Controller('exercises')
export default class ExercisesController {
  private exercisesService: ExercisesService;

  constructor(exercisesService: ExercisesService) {
    this.exercisesService = exercisesService;
  }

  @Get()
  getAllExercises(): string {
    return this.exercisesService.getAllExercises();
  }
}

import { Module } from '@nestjs/common';
import ExercisesController from './exercises.controller';
import ExercisesService from './exercises.service';

@Module({
  imports: [],
  controllers: [ExercisesController],
  providers: [ExercisesService],
})
export class ExerciseModule {}

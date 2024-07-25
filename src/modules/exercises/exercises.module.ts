import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercise } from 'src/modules/exercises/models/exercise.entity';
import { UserModule } from '../user/user.module';
import { WorkoutExercise } from '../workouts/models/workout-exercises.entity';
import ExercisesController from './controller/exercises.controller';
import { ExerciseRepository } from './repository/exercise.repository';
import ExercisesService from './services/exercises.service';

@Module({
  imports: [TypeOrmModule.forFeature([Exercise, WorkoutExercise]), UserModule],
  controllers: [ExercisesController],
  providers: [ExercisesService, ExerciseRepository],
  exports: [ExercisesService, ExerciseRepository],
})
export class ExerciseModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workout } from 'src/model';
import { ExerciseModule } from '../exercises/exercises.module';
import { CreateWorkoutAdapter } from './adapter/create-workout.adapter';
import { WorkoutResponseAdapter } from './adapter/workout-response.adapter';
import { WorkoutsController } from './controller/workouts.controller';
import { WorkoutsService } from './service/workouts.service';

@Module({
  imports: [TypeOrmModule.forFeature([Workout]), ExerciseModule],
  providers: [WorkoutsService, CreateWorkoutAdapter, WorkoutResponseAdapter],
  controllers: [WorkoutsController],
  exports: [WorkoutsService],
})
export class WorkoutsModule {}

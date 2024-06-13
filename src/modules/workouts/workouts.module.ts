import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workout } from 'src/model';
import { ExerciseModule } from '../exercises/exercises.module';
import { UserModule } from '../user/user.module';
// import { CreateWorkoutAdapter } from './adapter/create-workout.adapter';
// import { WorkoutResponseAdapter } from './adapter/workout-response.adapter';
import { WorkoutsController } from './controller/workouts.controller';
import { WorkoutsService } from './service/workouts.service';
import { WorkoutExercise } from 'src/model/workout-exercises.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workout]),
    TypeOrmModule.forFeature([WorkoutExercise]),
    ExerciseModule,
    UserModule,
  ],
  providers: [WorkoutsService],
  controllers: [WorkoutsController],
  exports: [WorkoutsService],
})
export class WorkoutsModule {}

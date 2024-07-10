import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Set, Workout } from 'src/model';
import { ExerciseModule } from '../exercises/exercises.module';
import { UserModule } from '../user/user.module';
// import { CreateWorkoutAdapter } from './adapter/create-workout.adapter';
// import { WorkoutResponseAdapter } from './adapter/workout-response.adapter';
import { WorkoutExercise } from 'src/model/workout-exercises.entity';
import { WorkoutsController } from './controller/workouts.controller';
import { WorkoutsService } from './service/workouts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workout, WorkoutExercise, Set]),
    ExerciseModule,
    UserModule,
  ],
  providers: [WorkoutsService],
  controllers: [WorkoutsController],
  exports: [WorkoutsService],
})
export class WorkoutsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExerciseModule } from '../exercises/exercises.module';
import { UserModule } from '../user/user.module';
import { WorkoutsController } from './controller/workouts.controller';
import { WorkoutExercise } from './models/workout-exercises.entity';
import { Workout } from './models/workout.entity';
import { WorkoutsService } from './service/workouts.service';

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

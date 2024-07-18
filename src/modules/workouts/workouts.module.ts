import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExerciseModule } from '../exercises/exercises.module';
import { UserModule } from '../user/user.module';
import { WorkoutsController } from './controller/workouts.controller';
import { Set } from './models/set.entity';
import { WorkoutExercise } from './models/workout-exercises.entity';
import { Workout } from './models/workout.entity';
import { WorkoutRepository } from './repository/workout.repository';
import { WorkoutsService } from './service/workouts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workout, WorkoutExercise, Set]),
    ExerciseModule,
    UserModule,
  ],
  providers: [WorkoutsService, WorkoutRepository],
  controllers: [WorkoutsController],
  exports: [WorkoutsService],
})
export class WorkoutsModule {}

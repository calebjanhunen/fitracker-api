import { Module } from '@nestjs/common';
import { DbModule } from 'src/common/database/database.module';
import { ExerciseModule } from '../exercises/exercises.module';
import { UserModule } from '../user/user.module';
import {
  LevelCalculator,
  WorkoutEffortXpCalculator,
  WorkoutGoalXpCalculator,
} from './calculator';
import { WorkoutController } from './controller/workout.controller';
import { WorkoutRepository } from './repository/workout.repository';
import { WorkoutService } from './service/workout.service';
import { WorkoutProfile } from './workout.profile';

@Module({
  imports: [ExerciseModule, DbModule, UserModule],
  providers: [
    WorkoutService,
    WorkoutRepository,
    WorkoutEffortXpCalculator,
    WorkoutGoalXpCalculator,
    WorkoutProfile,
    LevelCalculator,
  ],
  controllers: [WorkoutController],
  exports: [WorkoutService],
})
export class WorkoutModule {}

import { Module } from '@nestjs/common';
import { DbModule } from 'src/common/database/database.module';
import { LoggerServiceV2 } from 'src/common/logger/logger-v2.service';
import { ExerciseModule } from '../exercises/exercises.module';
import { UserModule } from '../user/user.module';
import { WorkoutController } from './controller/workout.controller';
import { WorkoutRepository } from './repository/workout.repository';
import { WorkoutEffortXpHelper } from './service/workout-effort-xp.helper';
import { WorkoutCalculator } from './service/workout.calculator';
import { WorkoutService } from './service/workout.service';

@Module({
  imports: [ExerciseModule, DbModule, UserModule],
  providers: [
    WorkoutService,
    WorkoutRepository,
    WorkoutCalculator,
    LoggerServiceV2,
    WorkoutEffortXpHelper,
  ],
  controllers: [WorkoutController],
  exports: [WorkoutService],
})
export class WorkoutModule {}

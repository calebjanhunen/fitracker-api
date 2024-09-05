import { Module } from '@nestjs/common';
import { DbModule } from 'src/common/database/database.module';
import { ExerciseModule } from '../exercises/exercises.module';
import { WorkoutController } from './controller/workout.controller';
import { WorkoutRepository } from './repository/workout.repository';
import { WorkoutService } from './service/workout.service';

@Module({
  imports: [ExerciseModule, DbModule],
  providers: [WorkoutService, WorkoutRepository],
  controllers: [WorkoutController],
  exports: [WorkoutService],
})
export class WorkoutModule {}

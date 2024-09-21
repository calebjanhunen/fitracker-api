import { Module } from '@nestjs/common';
import { DbModule } from 'src/common/database/database.module';
import { MyLoggerService } from 'src/common/logger/logger.service';
import { ExerciseModule } from '../exercises/exercises.module';
import { UserModule } from '../user/user.module';
import { WorkoutController } from './controller/workout.controller';
import { WorkoutRepository } from './repository/workout.repository';
import { WorkoutService } from './service/workout.service';

@Module({
  imports: [ExerciseModule, DbModule, UserModule],
  providers: [
    WorkoutService,
    WorkoutRepository,
    {
      provide: 'WorkoutRepoLogger',
      useFactory: () => new MyLoggerService(WorkoutRepository.name),
    },
  ],
  controllers: [WorkoutController],
  exports: [WorkoutService],
})
export class WorkoutModule {}

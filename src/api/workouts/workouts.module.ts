import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Set, Workout } from 'src/model';
import { UserModule } from '../user/user.module';
import { CreateWorkoutAdapter } from './adapter/create-workout.adapter';
import { WorkoutResponseAdapter } from './adapter/workout-response.adapter';
import { WorkoutsController } from './controller/workouts.controller';
import { WorkoutsService } from './service/workouts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workout]),
    TypeOrmModule.forFeature([Set]),
    UserModule,
  ],
  providers: [WorkoutsService, CreateWorkoutAdapter, WorkoutResponseAdapter],
  controllers: [WorkoutsController],
  exports: [WorkoutsService],
})
export class WorkoutsModule {}

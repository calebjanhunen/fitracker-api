import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Set, Workout } from 'src/model';
import { CreateWorkoutAdapter } from './adapter/create-workout.adapter';
import { WorkoutsController } from './controller/workouts.controller';
import { WorkoutsService } from './service/workouts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workout]),
    TypeOrmModule.forFeature([Set]),
  ],
  providers: [WorkoutsService, CreateWorkoutAdapter],
  controllers: [WorkoutsController],
})
export class WorkoutsModule {}

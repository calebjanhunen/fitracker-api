import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExerciseModule } from 'src/modules/exercises/exercises.module';
import { UserModule } from 'src/modules/user/user.module';
import { Workout } from 'src/modules/workouts/models/workout.entity';
import { WorkoutsModule } from 'src/modules/workouts/workouts.module';
import { WorkoutSeederService } from './workout-seeder.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workout]),
    WorkoutsModule,
    UserModule,
    ExerciseModule,
  ],
  providers: [WorkoutSeederService],
  exports: [WorkoutSeederService],
})
export class WorkoutSeederModule {}

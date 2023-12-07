import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExerciseModule } from 'src/api/exercises/exercises.module';
import { UserModule } from 'src/api/user/user.module';
import { WorkoutsModule } from 'src/api/workouts/workouts.module';
import { Workout } from 'src/model';
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

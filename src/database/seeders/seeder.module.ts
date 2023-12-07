import { Module } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { ExerciseSeederModule } from './exercises/exercise-seeder.module';
import { Seeder } from './seeder';
import { UserSeederModule } from './users/user-seeder.module';
import { WorkoutSeederModule } from './workouts/workout-seeder.module';

@Module({
  imports: [
    AppModule,
    UserSeederModule,
    ExerciseSeederModule,
    WorkoutSeederModule,
  ],
  providers: [Seeder],
})
export class SeederModule {}

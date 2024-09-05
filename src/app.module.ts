import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './modules/auth/auth.module';
import { ExerciseModule } from './modules/exercises/exercises.module';
import { UserModule } from './modules/user/user.module';
import { WorkoutModule } from './modules/workouts/workout.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // UserModule,
    AuthModule,
    ExerciseModule,
    WorkoutModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

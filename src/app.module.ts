import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './modules/auth/auth.module';
import { ExerciseModule } from './modules/exercises/exercises.module';
import { UserModule } from './modules/user/user.module';
import { WorkoutTemplatesModule } from './modules/workout-templates/workout-templates.module';
import { WorkoutsModule } from './modules/workouts/workouts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // UserModule,
    AuthModule,
    ExerciseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

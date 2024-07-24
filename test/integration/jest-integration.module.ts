import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/modules/auth/auth.module';
import { ExerciseModule } from 'src/modules/exercises/exercises.module';
import { UserModule } from 'src/modules/user/user.module';
import { WorkoutTemplatesModule } from 'src/modules/workout-templates/workout-templates.module';
import { WorkoutsModule } from 'src/modules/workouts/workouts.module';
import { integrationTypeOrmConfig } from './integration-test-datasource';

@Module({
  imports: [
    TypeOrmModule.forRoot(integrationTypeOrmConfig),
    ExerciseModule,
    UserModule,
    AuthModule,
    WorkoutsModule,
    WorkoutTemplatesModule,
  ],
})
export class IntegrationTestModule {}

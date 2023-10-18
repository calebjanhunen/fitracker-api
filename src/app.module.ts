import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { typeormConfig } from './config/typeorm.config';

import { AuthModule } from './api/auth/auth.module';
import { ExerciseModule } from './api/exercises/exercises.module';
import { UserModule } from './api/user/user.module';
import { WorkoutsModule } from './api/workouts/workouts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(typeormConfig),
    ExerciseModule,
    UserModule,
    AuthModule,
    WorkoutsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import 'src/common/extensions/date.extensions';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { LoggingInterceptor } from './common/interceptors/request-logger.interceptor';
import { LoggerModule } from './common/logger/logger.module';
import { AuthModule } from './modules/auth/auth.module';
import { ExerciseModule } from './modules/exercises/exercises.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { UserModule } from './modules/user/user.module';
import { WorkoutTemplateModule } from './modules/workout-template/workout-template.module';
import { WorkoutModule } from './modules/workouts/workout.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
    ExerciseModule,
    WorkoutModule,
    WorkoutTemplateModule,
    LoggerModule,
    LeaderboardModule,
  ],
  controllers: [],
  providers: [
    JwtAuthGuard,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}

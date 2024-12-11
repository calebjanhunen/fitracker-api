import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import 'src/common/extensions/date.extensions';
import { JwtAuthGlobalGuard } from './common/guards/jwt-auth-global.guard';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { LoggingInterceptor } from './common/interceptors/request-logger.interceptor';
import { LoggerModule } from './common/logger/logger.module';
import { AuthModule } from './modules/auth/auth.module';
import { BodyPartModule } from './modules/body-part/body-part.module';
import { EquipmentModule } from './modules/equipment/equipment.module';
import { ExerciseModule } from './modules/exercises/exercises.module';
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
    BodyPartModule,
    EquipmentModule,
    WorkoutTemplateModule,
    LoggerModule,
  ],
  controllers: [],
  providers: [
    JwtAuthGuard,
    JwtAuthGlobalGuard,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}

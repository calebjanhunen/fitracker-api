import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ScheduleModule } from '@nestjs/schedule';
import 'src/common/extensions/date.extensions';
import { LoggerServiceV2 } from './common/logger/logger-v2.service';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';
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
  ],
  controllers: [],
  providers: [LoggerServiceV2],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}

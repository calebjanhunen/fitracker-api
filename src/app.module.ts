import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ScheduleModule } from '@nestjs/schedule';
import 'src/common/extensions/date.extensions';
import { AssignCorrelationIdMiddleware } from './common/middleware/assign-correlation-id.middleware';
import { CorrelationIdService } from './common/services/correlation-id.service';
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
  providers: [CorrelationIdService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AssignCorrelationIdMiddleware).forRoutes('*');
  }
}

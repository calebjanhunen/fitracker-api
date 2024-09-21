import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AssignCorrelationIdMiddleware } from './common/middleware/assign-correlation-id.middleware';
import { CorrelationIdService } from './common/services/correlation-id.service';
import { AuthModule } from './modules/auth/auth.module';
import { BodyPartModule } from './modules/body-part/body-part.module';
import { EquipmentModule } from './modules/equipment/equipment.module';
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
    BodyPartModule,
    EquipmentModule,
  ],
  controllers: [],
  providers: [CorrelationIdService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AssignCorrelationIdMiddleware).forRoutes('*');
  }
}

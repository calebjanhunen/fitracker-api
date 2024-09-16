import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

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
  providers: [],
})
export class AppModule {}

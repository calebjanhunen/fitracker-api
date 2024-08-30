import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercise } from 'src/modules/exercises/models/exercise.entity';
import { BodyPartModule } from '../body-part/body-part.module';
import { EquipmentModule } from '../equipment/equipment.module';
import { UserModule } from '../user/user.module';
import { WorkoutExercise } from '../workouts/models/workout-exercises.entity';
import ExercisesController from './controller/exercises.controller';
import { ExerciseRepository } from './repository/exercise.repository';
import { ExerciseService } from './services/exercise.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Exercise, WorkoutExercise]),
    UserModule,
    EquipmentModule,
    BodyPartModule,
  ],
  controllers: [ExercisesController],
  providers: [ExerciseService, ExerciseRepository],
  exports: [ExerciseService, ExerciseRepository],
})
export class ExerciseModule {}

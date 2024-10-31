import { Module } from '@nestjs/common';
import { DbModule } from 'src/common/database/database.module';
import { LoggerServiceV2 } from 'src/common/logger/logger-v2.service';
import { BodyPartModule } from '../body-part/body-part.module';
import { EquipmentModule } from '../equipment/equipment.module';
import { UserModule } from '../user/user.module';
import ExercisesController from './controller/exercises.controller';
import { ExerciseProfile } from './exercise.profile';
import { ExerciseRepository } from './repository/exercise.repository';
import { ExerciseService } from './services/exercise.service';

@Module({
  imports: [UserModule, EquipmentModule, BodyPartModule, DbModule],
  controllers: [ExercisesController],
  providers: [
    ExerciseProfile,
    ExerciseService,
    ExerciseRepository,
    LoggerServiceV2,
  ],
  exports: [ExerciseService],
})
export class ExerciseModule {}

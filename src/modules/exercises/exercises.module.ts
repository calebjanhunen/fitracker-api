import { Module } from '@nestjs/common';
import { DbModule } from 'src/common/database/database.module';
import { UserModule } from '../user/user.module';
import { BodyPartController } from './controller/body-part.controller';
import { EquipmentController } from './controller/equipment.controller';
import ExercisesController from './controller/exercises.controller';
import { ExerciseProfile } from './exercise.profile';
import { BodyPartRepository } from './repository/body-part.repository';
import { EquipmentRepository } from './repository/equipment.repository';
import { ExerciseRepository } from './repository/exercise.repository';
import { BodyPartService } from './services/body-part.service';
import { EquipmentService } from './services/equipment.service';
import { ExerciseService } from './services/exercise.service';

@Module({
  imports: [UserModule, DbModule],
  controllers: [ExercisesController, BodyPartController, EquipmentController],
  providers: [
    ExerciseProfile,
    ExerciseService,
    ExerciseRepository,
    BodyPartService,
    BodyPartRepository,
    EquipmentService,
    EquipmentRepository,
  ],
  exports: [ExerciseService],
})
export class ExerciseModule {}

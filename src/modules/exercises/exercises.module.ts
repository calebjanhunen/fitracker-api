import { Module } from '@nestjs/common';
import { DbModule } from 'src/common/database/database.module';
import { UserModule } from '../user/user.module';
import { BodyPartController } from './controller/body-part.controller';
import { EquipmentController } from './controller/equipment.controller';
import ExercisesController from './controller/exercises.controller';
import { ExerciseProfile } from './exercise.profile';
import { BodyPartRepository } from './repository/body-part.repository';
import { CableAttachmentRepository } from './repository/cable-attachment.repository';
import { EquipmentRepository } from './repository/equipment.repository';
import { ExerciseVariationRepository } from './repository/exercise-variation.repository';
import { ExerciseRepository } from './repository/exercise.repository';
import { ExerciseVariationService } from './services';
import { BodyPartService } from './services/body-part.service';
import { CableAttachmentService } from './services/cable-attachment.service';
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
    CableAttachmentRepository,
    CableAttachmentService,
    ExerciseVariationRepository,
    ExerciseVariationService,
  ],
  exports: [ExerciseService, ExerciseVariationService],
})
export class ExerciseModule {}

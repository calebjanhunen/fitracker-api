import { Module } from '@nestjs/common';
import { DbModule } from 'src/common/database/database.module';
import { LoggerServiceV2 } from 'src/common/logger/logger-v2.service';
import { ExerciseModule } from '../exercises/exercises.module';
import { WorkoutTemplateController } from './workout-template.controller';
import { WorkoutTemplateProfile } from './workout-template.profile';
import { WorkoutTemplateRepository } from './workout-template.repository';
import { WorkoutTemplateService } from './workout-template.service';

@Module({
  imports: [DbModule, ExerciseModule],
  controllers: [WorkoutTemplateController],
  providers: [
    WorkoutTemplateProfile,
    WorkoutTemplateRepository,
    WorkoutTemplateService,
    LoggerServiceV2,
  ],
  exports: [],
})
export class WorkoutTemplateModule {}

import { Module } from '@nestjs/common';
import { DbModule } from 'src/common/database/database.module';
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
  ],
  exports: [],
})
export class WorkoutTemplateModule {}

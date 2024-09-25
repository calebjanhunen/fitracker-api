import { Module } from '@nestjs/common';
import { DbService } from 'src/common/database';
import { MyLoggerService } from 'src/common/logger/logger.service';
import { WorkoutTemplateController } from './workout-template.controller';
import { WorkoutTemplateProfile } from './workout-template.profile';
import { WorkoutTemplateRepository } from './workout-template.repository';

@Module({
  imports: [DbService],
  controllers: [WorkoutTemplateController],
  providers: [
    WorkoutTemplateProfile,
    WorkoutTemplateRepository,
    {
      provide: 'WorkoutTemplateRepoLogger',
      useFactory: () => new MyLoggerService(WorkoutTemplateRepository.name),
    },
  ],
  exports: [],
})
export class WorkoutTemplateModule {}

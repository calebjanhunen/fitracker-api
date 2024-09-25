import { Module } from '@nestjs/common';
import { DbModule } from 'src/common/database/database.module';
import { MyLoggerService } from 'src/common/logger/logger.service';
import { WorkoutTemplateController } from './workout-template.controller';
import { WorkoutTemplateProfile } from './workout-template.profile';
import { WorkoutTemplateRepository } from './workout-template.repository';

@Module({
  imports: [DbModule],
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

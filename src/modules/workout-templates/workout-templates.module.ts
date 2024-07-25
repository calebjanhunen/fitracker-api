import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExerciseModule } from '../exercises/exercises.module';
import { UserModule } from '../user/user.module';
import { WorkoutTemplateController } from './controller/workout-template.controller';
import { WorkoutTemplateExercise } from './models/workout-template-exercise.entity';
import { WorkoutTemplateSet } from './models/workout-template-set.entity';
import { WorkoutTemplate } from './models/workout-template.entity';
import { WorkoutTemplateRepository } from './repository/workout-template.repository';
import { WorkoutTemplateService } from './service/workout-template.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkoutTemplateExercise,
      WorkoutTemplate,
      WorkoutTemplateSet,
    ]),
    UserModule,
    ExerciseModule,
  ],
  providers: [WorkoutTemplateRepository, WorkoutTemplateService],
  controllers: [WorkoutTemplateController],
  exports: [WorkoutTemplateRepository],
})
export class WorkoutTemplatesModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { WorkoutTemplateExercise } from './models/workout-template-exercise.entity';
import { WorkoutTemplateSet } from './models/workout-template-set.entity';
import { WorkoutTemplate } from './models/workout-template.entity';
import { WorkoutTemplateRepository } from './repository/workout-template.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkoutTemplateExercise,
      WorkoutTemplate,
      WorkoutTemplateSet,
    ]),
    UserModule,
  ],
  providers: [WorkoutTemplateRepository],
  controllers: [],
  exports: [WorkoutTemplateRepository],
})
export class WorkoutTemplatesModule {}

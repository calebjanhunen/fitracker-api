import { AutoMap } from '@automapper/classes';

export class WorkoutTemplateResponseDto {
  @AutoMap()
  id: string;
  @AutoMap()
  name: string;
  @AutoMap()
  createdAt: Date;
  @AutoMap(() => WorkoutTemplateExerciseResponseDto)
  exercises: WorkoutTemplateExerciseResponseDto[];
}

export class WorkoutTemplateExerciseResponseDto {
  @AutoMap()
  exerciseId: string;
  @AutoMap()
  exerciseName: string;
  @AutoMap()
  order: number;
  @AutoMap(() => WorkoutTemplateSetResponseDto)
  sets: WorkoutTemplateSetResponseDto[];
}

export class WorkoutTemplateSetResponseDto {
  @AutoMap()
  id: string;
  @AutoMap()
  order: number;
}

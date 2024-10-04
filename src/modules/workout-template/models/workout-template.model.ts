import { AutoMap } from '@automapper/classes';

export class WorkoutTemplateModel {
  @AutoMap()
  id: string;
  @AutoMap()
  name: string;
  @AutoMap()
  createdAt: Date;
  @AutoMap(() => WorkoutTemplateExerciseModel)
  exercises: WorkoutTemplateExerciseModel[];
}

export class WorkoutTemplateExerciseModel {
  @AutoMap()
  exerciseId: string;
  @AutoMap()
  exerciseName: string;
  @AutoMap()
  order: number;
  @AutoMap(() => WorkoutTemplateSetModel)
  sets: WorkoutTemplateSetModel[];
}

export class WorkoutTemplateSetModel {
  @AutoMap()
  id: string;
  @AutoMap()
  order: number;
}

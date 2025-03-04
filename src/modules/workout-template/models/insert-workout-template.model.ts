import { AutoMap } from '@automapper/classes';

export class InsertWorkoutTemplateModel {
  @AutoMap()
  name: string;
  @AutoMap(() => InsertWorkoutTemplateExerciseModel)
  exercises: InsertWorkoutTemplateExerciseModel[];
}

export class InsertWorkoutTemplateExerciseModel {
  @AutoMap()
  exerciseId: string;

  @AutoMap()
  isVariation?: boolean;

  @AutoMap()
  order: number;

  @AutoMap(() => InsertWorkoutTemplateSetModel)
  sets: InsertWorkoutTemplateSetModel[];
}

export class InsertWorkoutTemplateSetModel {
  @AutoMap()
  order: number;
}

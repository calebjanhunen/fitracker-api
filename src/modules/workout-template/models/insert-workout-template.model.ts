import { AutoMap } from '@automapper/classes';

export class InsertWorkoutTemplateModel {
  @AutoMap()
  name: string;
  @AutoMap()
  createdAt: Date;
  @AutoMap(() => InsertWorkoutTemplateExerciseModel)
  exercises: InsertWorkoutTemplateExerciseModel[];
}

export class InsertWorkoutTemplateExerciseModel {
  @AutoMap()
  exerciseId: string;
  @AutoMap()
  order: number;
  @AutoMap(() => InsertWorkoutTemplateSetModel)
  sets: InsertWorkoutTemplateSetModel[];
}

export class InsertWorkoutTemplateSetModel {
  @AutoMap()
  order: number;
}

import { AutoMap } from '@automapper/classes';

export class InsertWorkoutModel {
  @AutoMap()
  name: string;
  @AutoMap()
  createdAt: Date;
  @AutoMap()
  lastUpdatedAt: Date;
  @AutoMap()
  duration: number;
  @AutoMap()
  gainedXp: number;
  @AutoMap(() => InsertWorkoutExerciseModel)
  exercises: InsertWorkoutExerciseModel[];
}

export class InsertWorkoutExerciseModel {
  @AutoMap()
  exerciseId: string;

  @AutoMap()
  isVariation?: boolean;

  @AutoMap()
  order: number;

  @AutoMap(() => InsertWorkoutSetModel)
  sets: InsertWorkoutSetModel[];
}

export class InsertWorkoutSetModel {
  @AutoMap()
  order: number;
  @AutoMap()
  weight: number;
  @AutoMap()
  reps: number;
  @AutoMap()
  rpe?: number;
}

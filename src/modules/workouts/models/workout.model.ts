import { AutoMap } from '@automapper/classes';

export class WorkoutModel {
  @AutoMap()
  id: string;

  @AutoMap()
  workoutDate: string;

  @AutoMap()
  duration: number;

  @AutoMap()
  name: string;

  @AutoMap()
  gainedXp: number;

  @AutoMap(() => WorkoutExerciseModel)
  exercises: WorkoutExerciseModel[];
}

export class WorkoutExerciseModel {
  @AutoMap()
  exerciseId: string;

  @AutoMap()
  name: string;

  @AutoMap()
  order: number;

  @AutoMap(() => WorkoutSetModel)
  sets: WorkoutSetModel[];
}

export class WorkoutSetModel {
  @AutoMap()
  id: string;

  @AutoMap()
  order: number;

  @AutoMap()
  weight: number;

  @AutoMap()
  reps: number;

  @AutoMap()
  rpe?: number;
}

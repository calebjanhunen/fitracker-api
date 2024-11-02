import { AutoMap } from '@automapper/classes';

export class WorkoutModel {
  id: string;
  createdAt: string;
  duration: number;
  name: string;
  gainedXp: number;
  exercises: WorkoutExerciseModel[];
}

export class WorkoutExerciseModel {
  id: string;
  name: string;
  order: number;
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
  rpe: number | null;
}

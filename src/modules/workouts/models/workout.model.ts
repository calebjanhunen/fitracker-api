export class WorkoutModel {
  id: string;
  createdAt: string;
  name: string;
  exercises: WorkoutExerciseModel[];
}

export class WorkoutExerciseModel {
  id: string;
  name: string;
  order: number;
  sets: WorkoutSetModel[];
}

export class WorkoutSetModel {
  id: string;
  order: number;
  weight: number;
  reps: number;
  rpe: number;
}

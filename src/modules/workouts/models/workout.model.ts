export class WorkoutModel {
  id: string;
  name: string;
  exercises: WorkoutExerciseModel[];
}

export class WorkoutExerciseModel {
  id: string;
  workoutId: string;
  exerciseId: string;
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

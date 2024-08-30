export class WorkoutModel {
  name: string;
  exercises: InsertWorkoutExerciseModel[];
}

export class InsertWorkoutExerciseModel {
  workoutId: string;
  exerciseId: string;
  order: number;
  sets: InsertWorkoutSetModel[];
}

export class InsertWorkoutSetModel {
  order: number;
  weight: number;
  reps: number;
  rpe: number;
}

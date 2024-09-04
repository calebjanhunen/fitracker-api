export class InsertWorkoutModel {
  name: string;
  exercises: InsertWorkoutExerciseModel[];
}

export class InsertWorkoutExerciseModel {
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
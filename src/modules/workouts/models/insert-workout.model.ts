export class InsertWorkoutModel {
  name: string;
  createdAt: Date;
  lastUpdatedAt: Date;
  duration: number;
  gainedXp: number;
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
  rpe: number | null;
}

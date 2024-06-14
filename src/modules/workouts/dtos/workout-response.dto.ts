export class WorkoutResponseDto {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  exercises: ExerciseInWorkoutResponseDto[];
}

export class ExerciseInWorkoutResponseDto {
  id: string;
  name: string;
  sets: SetInWorkoutResponseDto[];
}

export class SetInWorkoutResponseDto {
  setOrder: number;
  weight: number;
  reps: number;
  rpe: number;
}

export class WorkoutResponseDto {
  id: string;
  name: string;
  exercises: WorkoutExerciseResponseDto[];
}

export class WorkoutExerciseResponseDto {
  id: string;
  name: string;
  order: number;
  sets: WorkoutSetResponseDto[];
}

export class WorkoutSetResponseDto {
  id: string;
  order: number;
  weight: number;
  reps: number;
  rpe: number;
}

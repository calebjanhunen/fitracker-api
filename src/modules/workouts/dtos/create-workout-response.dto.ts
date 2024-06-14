export class WorkoutResponseDTO {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  exercises: ExerciseResponseDTO[];
}

export class ExerciseResponseDTO {
  id: string;
  name: string;
  sets: SetResponseDTO[];
}

export class SetResponseDTO {
  id: string;
  weight: number;
  reps: number;
  rpe: number;
  setOrder: number;
}

import { Expose } from 'class-transformer';

export class WorkoutResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  createdAt: Date;

  @Expose()
  duration: number;

  @Expose()
  exercises: WorkoutExerciseResponseDto[];
}

export class WorkoutExerciseResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  order: number;

  @Expose()
  sets: WorkoutSetResponseDto[];
}

export class WorkoutSetResponseDto {
  @Expose()
  id: string;

  @Expose()
  order: number;

  @Expose()
  weight: number;

  @Expose()
  reps: number;

  @Expose()
  rpe: number;
}

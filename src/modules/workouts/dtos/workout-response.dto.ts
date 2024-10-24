import { AutoMap } from '@automapper/classes';
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
  @AutoMap()
  @Expose()
  id: string;
  @AutoMap()
  @Expose()
  order: number;
  @AutoMap()
  @Expose()
  weight: number;
  @AutoMap()
  @Expose()
  reps: number;
  @AutoMap()
  @Expose()
  rpe: number | null;
}

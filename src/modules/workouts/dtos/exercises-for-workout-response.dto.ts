import { Expose, plainToClass } from 'class-transformer';
import { ExerciseForWorkout } from 'src/modules/exercises/interfaces/exercise-for-workout.interface';
import { Set } from '../models/set.entity';

export class ExerciseForWorkoutResponseDTO {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  primaryMuscle: string;

  @Expose()
  numTimesUsed: number;

  previousSets: Set[];

  static toDTO(entity: ExerciseForWorkout) {
    const dto = plainToClass(ExerciseForWorkoutResponseDTO, entity);
    dto.numTimesUsed = Number(dto.numTimesUsed);
    return dto;
  }
}

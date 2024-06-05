import { Expose, plainToClass } from 'class-transformer';
import { ExerciseForWorkout } from 'src/modules/exercises/interfaces/exercise-for-workout.interface';

export class ExerciseForWorkoutResponseDTO {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose({ name: 'primary_muscle' })
  primaryMuscle: string;

  @Expose({ name: 'num_times_used' })
  numTimesUsed: number;

  static toDTO(entity: ExerciseForWorkout) {
    const dto = plainToClass(ExerciseForWorkoutResponseDTO, entity);
    dto.numTimesUsed = Number(dto.numTimesUsed);
    return dto;
  }
}

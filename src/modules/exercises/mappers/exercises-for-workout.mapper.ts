import { plainToInstance } from 'class-transformer';
import { ExerciseForWorkoutResponseDTO } from 'src/modules/exercises/dtos/exercises-for-workout-response.dto';
import { ExerciseForWorkout } from '../interfaces/exercise-for-workout.interface';

export class ExercisesForWorkoutMapper {
  public static fromEntityToDto(
    entity: ExerciseForWorkout,
  ): ExerciseForWorkoutResponseDTO {
    const dto = plainToInstance(ExerciseForWorkoutResponseDTO, entity);
    dto.numTimesUsed = Number(dto.numTimesUsed);
    return dto;
  }
}

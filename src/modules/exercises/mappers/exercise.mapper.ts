import { Exercise } from 'src/model';
import { ExerciseRequestDto } from '../dtos/exercise-request.dto';
import { ExerciseResponseDto } from '../dtos/exercise-response.dto';

export class ExerciseMapper {
  public static fromDtoToEntity(exerciseDto: ExerciseRequestDto): Exercise {
    const entity = new Exercise();
    entity.name = exerciseDto.name;
    entity.difficultyLevel = exerciseDto.difficultyLevel;
    entity.equipment = exerciseDto.equipment;
    entity.instructions = exerciseDto.instructions;
    entity.primaryMuscle = exerciseDto.primaryMuscle;
    entity.secondaryMuscles = exerciseDto.secondaryMuscles;
    entity.isCustom = true;
    return entity;
  }

  public static fromEntityToDto(entity: Exercise): ExerciseResponseDto {
    const dto = new ExerciseResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.difficultyLevel = entity.difficultyLevel;
    dto.equipment = entity.equipment;
    dto.instructions = entity.instructions;
    dto.primaryMuscle = entity.primaryMuscle;
    dto.secondaryMuscles = entity.secondaryMuscles;
    dto.isCustom = entity.isCustom;
    dto.userId = entity.user?.id;
    return dto;
  }
}

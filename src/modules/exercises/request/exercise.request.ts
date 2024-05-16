import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Exercise, User } from 'src/model';
import { ExerciseDifficultyLevel } from 'src/modules/exercises/enums/exercise-difficulty-level';

export class ExerciseRequest {
  @IsNotEmpty()
  @IsString()
  public name: string;

  @IsNotEmpty()
  @IsEnum(ExerciseDifficultyLevel)
  public difficultyLevel: ExerciseDifficultyLevel;

  @IsNotEmpty()
  @IsString()
  public equipment: string;

  @IsArray()
  @IsString({ each: true })
  public instructions: string[];

  @IsNotEmpty()
  @IsString()
  public primaryMuscle: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  public secondaryMuscles: string[];

  /**
   * Transform create exercise request to exercise entity
   * @param {ExerciseRequest} request
   * @param {User} user
   * @returns {Exercise}
   */
  public fromCreateRequestToEntity(
    request: ExerciseRequest,
    user: User,
  ): Exercise {
    const entity = new Exercise();
    entity.name = request.name;
    entity.difficultyLevel = request.difficultyLevel;
    entity.equipment = request.equipment;
    entity.instructions = request.instructions;
    entity.primaryMuscle = request.primaryMuscle;
    entity.secondaryMuscles = request.secondaryMuscles;
    entity.isCustom = true;
    entity.user = user;

    return entity;
  }

  public fromUpdateRequestToEntity(request: ExerciseRequest): Exercise {
    const entity = new Exercise();
    entity.name = request.name;
    entity.difficultyLevel = request.difficultyLevel;
    entity.equipment = request.equipment;
    entity.instructions = request.instructions;
    entity.primaryMuscle = request.primaryMuscle;
    entity.secondaryMuscles = request.secondaryMuscles;
    entity.isCustom = true;

    return entity;
  }
}

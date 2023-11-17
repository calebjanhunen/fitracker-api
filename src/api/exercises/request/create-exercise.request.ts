import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ExerciseDifficultyLevel } from 'src/api/utils/enums/exercise-difficulty-level';
import { Exercise, User } from 'src/model';

export class CreateExerciseRequest {
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
   * @param {CreateExerciseRequest} request
   * @param {User} user
   * @returns {Exercise}
   */
  public fromRequestToEntity(
    request: CreateExerciseRequest,
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
}

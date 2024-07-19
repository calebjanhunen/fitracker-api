import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ExerciseDifficultyLevel } from '../enums/exercise-difficulty-level';

export class ExerciseRequestDto {
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
}

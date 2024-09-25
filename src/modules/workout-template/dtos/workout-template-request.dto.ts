import { AutoMap } from '@automapper/classes';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class WorkoutTemplateRequestDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsDate()
  @IsNotEmpty()
  public createdAt: Date;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => WorkoutTemplateExerciseRequestDto)
  public exercises: WorkoutTemplateExerciseRequestDto[];
}

export class WorkoutTemplateExerciseRequestDto {
  @IsUUID()
  @IsNotEmpty()
  public exerciseId: string;

  @IsInt()
  @Min(1)
  public order: number;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => WorkoutTemplateSetRequestDto)
  public sets: WorkoutTemplateSetRequestDto[];
}

export class WorkoutTemplateSetRequestDto {
  @IsInt()
  @Min(1)
  public order: number;
}

import { AutoMap } from '@automapper/classes';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
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
  @AutoMap()
  public name: string;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => WorkoutTemplateExerciseRequestDto)
  @AutoMap(() => WorkoutTemplateExerciseRequestDto)
  public exercises: WorkoutTemplateExerciseRequestDto[];
}

export class WorkoutTemplateExerciseRequestDto {
  @IsUUID()
  @IsNotEmpty()
  @AutoMap()
  public exerciseId: string;

  @IsInt()
  @Min(1)
  @AutoMap()
  public order: number;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => WorkoutTemplateSetRequestDto)
  @AutoMap(() => WorkoutTemplateSetRequestDto)
  public sets: WorkoutTemplateSetRequestDto[];
}

export class WorkoutTemplateSetRequestDto {
  @IsInt()
  @Min(1)
  @AutoMap()
  public order: number;
}

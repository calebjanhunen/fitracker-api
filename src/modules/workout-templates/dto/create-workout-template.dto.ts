import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { SetType } from 'src/common/enums/set-type.enum';

export class CreateWorkoutTemplateDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkoutTemplateExerciseDto)
  public exercises: CreateWorkoutTemplateExerciseDto[];
}

export class CreateWorkoutTemplateExerciseDto {
  @IsUUID()
  @IsNotEmpty()
  public id: string;

  @IsInt()
  @Min(1)
  order: number;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkoutTemplateSetDto)
  public sets: CreateWorkoutTemplateSetDto[];
}

export class CreateWorkoutTemplateSetDto {
  @IsInt()
  @Min(1)
  public order: number;

  @IsEnum(SetType)
  public setType: SetType;
}

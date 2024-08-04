import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { SetType } from 'src/common/enums/set-type.enum';

export class WorkoutTemplateRequestDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => WorkoutTemplateRequestExerciseDto)
  public exercises: WorkoutTemplateRequestExerciseDto[];
}

export class WorkoutTemplateRequestExerciseDto {
  @IsUUID()
  @IsOptional()
  public id?: string;

  @IsUUID()
  @IsNotEmpty()
  public exerciseId: string;

  @IsInt()
  @Min(1)
  order: number;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => WorkoutTemplateRequestSetDto)
  public sets: WorkoutTemplateRequestSetDto[];
}

export class WorkoutTemplateRequestSetDto {
  @IsUUID()
  @IsOptional()
  public id?: string;

  @IsInt()
  @Min(1)
  public order: number;

  @IsEnum(SetType)
  public setType: SetType;
}

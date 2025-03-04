import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class WorkoutTemplateSetRequestDto {
  @IsInt()
  @Min(1)
  @AutoMap()
  @ApiProperty()
  public order: number;
}

export class WorkoutTemplateExerciseRequestDto {
  @IsUUID()
  @IsNotEmpty()
  @AutoMap()
  @ApiProperty()
  public exerciseId: string;

  @IsInt()
  @Min(1)
  @AutoMap()
  @ApiProperty()
  public order: number;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ type: Boolean, required: false })
  @AutoMap()
  public isVariation?: boolean;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => WorkoutTemplateSetRequestDto)
  @AutoMap(() => WorkoutTemplateSetRequestDto)
  @ApiProperty({ type: WorkoutTemplateSetRequestDto, isArray: true })
  public sets: WorkoutTemplateSetRequestDto[];
}

export class WorkoutTemplateRequestDto {
  @IsString()
  @IsNotEmpty()
  @AutoMap()
  @ApiProperty()
  public name: string;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => WorkoutTemplateExerciseRequestDto)
  @AutoMap(() => WorkoutTemplateExerciseRequestDto)
  @ApiProperty({ type: WorkoutTemplateExerciseRequestDto, isArray: true })
  public exercises: WorkoutTemplateExerciseRequestDto[];
}

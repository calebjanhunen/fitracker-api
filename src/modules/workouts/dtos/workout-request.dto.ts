import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class WorkoutRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @AutoMap()
  public name: string;

  @IsDate()
  @IsNotEmpty()
  @ApiProperty()
  @AutoMap()
  public createdAt: Date;

  @IsDate()
  @IsNotEmpty()
  @ApiProperty()
  @AutoMap()
  public lastUpdatedAt: Date;

  @IsInt()
  @IsNotEmpty()
  @Min(0)
  @ApiProperty()
  @AutoMap()
  public duration: number;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => WorkoutExerciseRequestDto)
  @ApiProperty({ type: () => WorkoutExerciseRequestDto, isArray: true })
  @AutoMap(() => WorkoutExerciseRequestDto)
  public exercises: WorkoutExerciseRequestDto[];
}

export class WorkoutExerciseRequestDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  @AutoMap()
  public exerciseId: string;

  @IsInt()
  @Min(1)
  @ApiProperty()
  @AutoMap()
  public order: number;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => WorkoutSetRequestDto)
  @ApiProperty({ type: () => WorkoutSetRequestDto, isArray: true })
  @AutoMap(() => WorkoutSetRequestDto)
  public sets: WorkoutSetRequestDto[];
}

export class WorkoutSetRequestDto {
  @IsNumber()
  @Min(0)
  @ApiProperty()
  @AutoMap()
  public weight: number;

  @IsInt()
  @Min(1)
  @ApiProperty()
  @AutoMap()
  public reps: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  @ApiProperty({ type: Number, nullable: true })
  @AutoMap()
  public rpe?: number;

  @IsInt()
  @Min(1)
  @ApiProperty()
  @AutoMap()
  public order: number;
}

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
  public name: string;

  @IsDate()
  @IsNotEmpty()
  @ApiProperty()
  public createdAt: Date;

  @IsDate()
  @IsNotEmpty()
  @ApiProperty()
  public lastUpdatedAt: Date;

  @IsInt()
  @IsNotEmpty()
  @Min(0)
  @ApiProperty()
  public duration: number;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => WorkoutExerciseRequestDto)
  @ApiProperty({ type: () => WorkoutExerciseRequestDto, isArray: true })
  public exercises: WorkoutExerciseRequestDto[];
}

export class WorkoutExerciseRequestDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  public exerciseId: string;

  @IsInt()
  @Min(1)
  @ApiProperty()
  public order: number;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => WorkoutSetRequestDto)
  @ApiProperty({ type: () => WorkoutSetRequestDto, isArray: true })
  public sets: WorkoutSetRequestDto[];
}

export class WorkoutSetRequestDto {
  @IsNumber()
  @Min(0)
  @ApiProperty()
  public weight: number;

  @IsInt()
  @Min(1)
  @ApiProperty()
  public reps: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  @ApiProperty({ type: Number, nullable: true })
  public rpe: number | null;

  @IsInt()
  @Min(1)
  @ApiProperty()
  public order: number;
}

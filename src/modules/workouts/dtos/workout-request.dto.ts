import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsDate,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class WorkoutRequestDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsDate()
  @IsNotEmpty()
  public createdAt: Date;

  @IsInt()
  @IsNotEmpty()
  @Min(0)
  public duration: number;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => WorkoutExerciseRequestDto)
  public exercises: WorkoutExerciseRequestDto[];
}

export class WorkoutExerciseRequestDto {
  @IsUUID()
  @IsNotEmpty()
  public exerciseId: string;

  @IsInt()
  @Min(1)
  public order: number;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => WorkoutSetRequestDto)
  public sets: WorkoutSetRequestDto[];
}

export class WorkoutSetRequestDto {
  @IsNumber()
  @Min(1)
  public weight: number;

  @IsInt()
  @Min(1)
  public reps: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  public rpe: number;

  @IsInt()
  @Min(1)
  public order: number;
}

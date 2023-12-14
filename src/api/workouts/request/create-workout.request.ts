import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateWorkoutRequest {
  @IsString()
  public name: string;

  @ValidateNested({ each: true })
  @Type(() => ExerciseInWorkoutRequest)
  public exercises: ExerciseInWorkoutRequest[];
}

export class ExerciseInWorkoutRequest {
  @IsUUID()
  @IsNotEmpty()
  public id: string;

  @ValidateNested({ each: true })
  @Type(() => SetInExerciseRequest)
  public sets: SetInExerciseRequest[];
}

export class SetInExerciseRequest {
  @IsNumber()
  public weight: number;

  @IsInt()
  public reps: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  public rpe: number;
}

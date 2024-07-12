import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateWorkoutRequestDTO {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ExerciseDTO)
  public exercises: ExerciseDTO[];
}

export class ExerciseDTO {
  @IsUUID()
  @IsNotEmpty()
  public id: string;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SetDTO)
  public sets: SetDTO[];
}

export class SetDTO {
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
  public setOrder: number;
}

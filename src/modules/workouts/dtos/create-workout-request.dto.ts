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

export class CreateWorkoutRequestDTO {
  @IsString()
  public name: string;

  @ValidateNested({ each: true })
  @Type(() => ExerciseDTO)
  public exercises: ExerciseDTO[];
}

export class ExerciseDTO {
  @IsUUID()
  @IsNotEmpty()
  public id: string;

  @ValidateNested({ each: true })
  @Type(() => SetDTO)
  public sets: SetDTO[];
}

export class SetDTO {
  @IsNumber()
  public weight: number;

  @IsInt()
  public reps: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  public rpe: number;

  @IsInt()
  @Min(1)
  public setOrder: number;
}

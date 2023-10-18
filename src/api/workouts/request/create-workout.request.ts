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
  @Type(() => Exercise)
  public exercises: Exercise[];
}

class Exercise {
  @IsUUID()
  @IsNotEmpty()
  public id: string;

  @ValidateNested({ each: true })
  @Type(() => Set)
  public sets: Set[];
}

class Set {
  @IsNumber()
  public weight: number;

  @IsInt()
  public reps: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  public rpe: number;
}

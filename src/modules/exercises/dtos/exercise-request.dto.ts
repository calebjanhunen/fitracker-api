import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class ExerciseRequestDto {
  @IsNotEmpty()
  @IsString()
  public name: string;

  @IsNotEmpty()
  @IsInt()
  public equipment: number;

  @IsNotEmpty()
  @IsInt()
  public bodyPart: number;
}

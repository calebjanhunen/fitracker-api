import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class ExerciseRequestDto {
  @IsNotEmpty()
  @IsString()
  public name: string;

  @IsNotEmpty()
  @IsInt()
  public equipmentId: number;

  @IsNotEmpty()
  @IsInt()
  public bodyPartId: number;
}

import { IsInt, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ExerciseRequestDto {
  @IsUUID()
  public id: string;
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

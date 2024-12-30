import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class ExerciseRequestDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  public name: string;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty()
  public equipmentId: number;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty()
  public bodyPartId: number;
}

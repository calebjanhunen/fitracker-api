import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ExerciseRequestDto {
  @IsUUID()
  @ApiProperty()
  public id: string;
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

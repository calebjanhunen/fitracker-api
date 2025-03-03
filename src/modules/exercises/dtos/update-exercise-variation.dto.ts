import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateExerciseVariationDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  @AutoMap()
  public name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  @AutoMap()
  public notes?: string;
}

import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateExerciseVariationDto {
  @IsString()
  @IsNotEmpty()
  @AutoMap()
  @ApiProperty({ type: String, required: true })
  public name: string;

  @IsInt()
  @IsOptional()
  @AutoMap()
  @ApiProperty({ type: Number })
  public cableAttachmentId?: number;

  @IsString()
  @IsOptional()
  @AutoMap()
  @ApiProperty({ type: String })
  @MaxLength(255)
  public notes?: string;
}

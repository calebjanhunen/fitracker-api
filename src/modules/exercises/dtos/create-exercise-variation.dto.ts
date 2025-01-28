import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateExerciseVariationDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, required: true })
  public name: string;

  @IsInt()
  @IsOptional()
  @ApiProperty({ type: Number })
  public attachmentId?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: String })
  public notes?: string;
}

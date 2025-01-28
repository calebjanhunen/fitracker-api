import { ApiProperty } from '@nestjs/swagger';

export class ExerciseVariationDto {
  @ApiProperty({ type: String, required: true })
  public id: string;

  @ApiProperty({ type: String, required: true })
  public name: string;

  @ApiProperty({ type: String })
  public cableAttachment?: string;

  @ApiProperty({ type: String })
  public notes?: string;
}

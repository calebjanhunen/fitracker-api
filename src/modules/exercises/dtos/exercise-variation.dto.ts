import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';

export class ExerciseVariationDto {
  @AutoMap()
  @ApiProperty({ type: String, required: true })
  public id: string;

  @AutoMap()
  @ApiProperty({ type: String, required: true })
  public name: string;

  @AutoMap()
  @ApiProperty({ type: String })
  public cableAttachment?: string;

  @AutoMap()
  @ApiProperty({ type: String })
  public notes?: string;
}

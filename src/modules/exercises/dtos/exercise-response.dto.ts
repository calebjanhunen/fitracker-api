import { ApiProperty } from '@nestjs/swagger';

export class ExerciseResponseDto {
  @ApiProperty()
  public id: string;
  @ApiProperty()
  public name: string;
  @ApiProperty()
  public equipment: string;
  @ApiProperty()
  public bodyPart: string;
  @ApiProperty()
  public isCustom: boolean;
}

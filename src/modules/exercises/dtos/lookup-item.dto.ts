import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';

export class LookupItemDto {
  @AutoMap()
  @ApiProperty({ type: Number, required: true })
  id: number;

  @AutoMap()
  @ApiProperty({ type: String, required: true })
  name: string;
}

import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';

export class RecentSetDto {
  @ApiProperty()
  @AutoMap()
  id: string;

  @ApiProperty()
  @AutoMap()
  weight: number;

  @ApiProperty()
  @AutoMap()
  reps: number;

  @ApiProperty({ type: 'integer', required: false })
  @AutoMap()
  rpe?: number;
}

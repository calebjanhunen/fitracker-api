import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteWorkoutDto {
  @ApiProperty({ type: Number, required: true })
  @AutoMap()
  totalUserXp: number;
}

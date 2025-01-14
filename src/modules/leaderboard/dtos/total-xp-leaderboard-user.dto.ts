import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';

export class TotalXpLeaderboardUserDto {
  @AutoMap()
  @ApiProperty({ type: String, required: true })
  public username: string;

  @AutoMap()
  @ApiProperty({ type: Number, required: true })
  public totalXp: number;
}

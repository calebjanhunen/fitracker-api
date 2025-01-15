import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @AutoMap()
  @ApiProperty({ type: String, required: true })
  firstName: string;

  @AutoMap()
  @ApiProperty({ type: String, required: true })
  lastName: string;

  @AutoMap()
  @ApiProperty({ type: Number, required: true })
  weeklyWorkoutGoal: number;

  @AutoMap()
  @ApiProperty({ type: Number, required: true })
  totalXp: number;

  @AutoMap()
  @ApiProperty({ type: Number, required: true })
  level: number;

  @AutoMap()
  @ApiProperty({ type: Number, required: true })
  currentXp: number;

  @AutoMap()
  @ApiProperty({ type: Number, required: true })
  xpNeededForCurrentLevel: number;

  @AutoMap()
  @ApiProperty({ type: String, required: true })
  role: string;
}

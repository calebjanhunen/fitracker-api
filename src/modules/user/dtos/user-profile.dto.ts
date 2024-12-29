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
}

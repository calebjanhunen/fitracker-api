import { ApiProperty } from '@nestjs/swagger';
import { BodyPart } from 'src/common/enums/body-part.enum';

export class RecentSetDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  weight: number;
  @ApiProperty()
  reps: number;
  @ApiProperty()
  rpe: number;
}

export class ExerciseWithWorkoutDetailsDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  bodyPart: BodyPart;
  @ApiProperty()
  equipment: string;
  @ApiProperty()
  numTimesUsed: number;
  @ApiProperty({ type: RecentSetDto, isArray: true })
  recentSets: RecentSetDto[];
}

import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { BodyPart } from 'src/common/enums/body-part.enum';

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

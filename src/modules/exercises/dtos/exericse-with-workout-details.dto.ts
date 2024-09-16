import { BodyPart } from 'src/common/enums/body-part.enum';

export class ExerciseWithWorkoutDetailsDto {
  id: string;
  name: string;
  bodyPart: BodyPart;
  numTimesUsed: number;
  recentSets: RecentSetDto[];
}

export class RecentSetDto {
  id: string;
  weight: number;
  reps: number;
  rpe: number;
}

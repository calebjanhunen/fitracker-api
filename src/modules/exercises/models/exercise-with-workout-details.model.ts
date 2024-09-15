import { BodyPart } from 'src/common/enums/body-part.enum';
import { RecentSetModel } from './recent-sets-for-exercise.model';

export class ExerciseWithWorkoutDetailsModel {
  id: string;
  name: string;
  bodyPart: BodyPart;
  numTimesUsed: number;
  recentSets: RecentSetModel[];
}

import { RecentSetModel } from './recent-sets-for-exercise.model';

export class ExerciseWithWorkoutDetailsModel {
  id: string;
  name: string;
  bodyPart: string;
  numTimesUsed: number;
  recentSets: RecentSetModel[];
}

import { RecentSetModel } from './recent-sets-for-exercise.model';

export class ExerciseWithWorkoutDetailsModel {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  numTimesUsed: number;
  recentSets: RecentSetModel[];
}

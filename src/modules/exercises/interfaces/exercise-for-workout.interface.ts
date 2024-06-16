import { Exercise, Set } from 'src/model';

export interface ExerciseForWorkout extends Exercise {
  numTimesUsed: string;
  previousSets: Set[];
}

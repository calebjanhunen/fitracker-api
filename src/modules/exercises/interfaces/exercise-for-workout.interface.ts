import { Exercise } from 'src/model';

export interface ExerciseForWorkout extends Exercise {
  numTimesUsed: string;
}

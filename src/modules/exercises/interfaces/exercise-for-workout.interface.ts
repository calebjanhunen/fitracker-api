import { Exercise } from 'src/model';
import { Set } from 'src/modules/workouts/models/set.entity';

export interface ExerciseForWorkout extends Exercise {
  numTimesUsed: string;
  previousSets: Set[];
}

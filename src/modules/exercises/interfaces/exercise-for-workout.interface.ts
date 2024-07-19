import { Exercise } from 'src/modules/exercises/models/exercise.entity';
import { Set } from 'src/modules/workouts/models/set.entity';

export interface ExerciseForWorkout extends Exercise {
  numTimesUsed: string;
  previousSets: Set[];
}

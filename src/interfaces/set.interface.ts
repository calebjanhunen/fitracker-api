import { Base } from './base.interface';
import { IExercise } from './exercise.interface';
import { IWorkout } from './workout.interface';

export interface ISet extends Base {
  weight: number;
  reps: number;
  rpe: number;
  exercise: IExercise;
  workout: IWorkout;
}

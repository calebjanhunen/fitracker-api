import { IExercise } from './exercise.interface';
import { IWorkout } from './workout.interface';

export interface ISet {
  id: string;
  weight: number;
  reps: number;
  rpe: number;
  workout: IWorkout;
  exercise: IExercise;
}

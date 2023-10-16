import { Base } from './base.interface';
import { IExercise } from './exercise.interface';
import { IUser } from './user.interface';

export interface IWorkout extends Base {
  user: IUser;
  name: string;
  exercises: IExercise[];
}

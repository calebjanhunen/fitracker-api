import { IExercise } from './exercise.interface';
import { IUser } from './user.interface';

export interface IWorkout {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  user: IUser;
  name: string;
  exercises: IExercise[];
}

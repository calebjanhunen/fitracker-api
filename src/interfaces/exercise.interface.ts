import { ExerciseDifficultyLevel } from 'src/api/utils/enums/exercise-difficulty-level';
import { IUser } from './user.interface';

export interface IExercise {
  name: string;
  difficultyLevel: ExerciseDifficultyLevel;
  equipment: string;
  instructions: string[];
  primaryMuscle: string;
  secondaryMuscles: string[];
  isCustom: boolean;
  user: IUser | null;
}

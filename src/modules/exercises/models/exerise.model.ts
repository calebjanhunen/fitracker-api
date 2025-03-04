import { AutoMap } from '@automapper/classes';
import { ExerciseType } from '../enums/exercise-type.enum';
import { RecentSetModel } from './recent-sets-for-exercise.model';

export class ExerciseModel {
  @AutoMap()
  id: string;

  @AutoMap()
  name: string;

  @AutoMap()
  public notes?: string;

  @AutoMap()
  bodyPart: string;

  @AutoMap()
  equipment: string;

  @AutoMap()
  isCustom: boolean;

  @AutoMap()
  public exerciseType: ExerciseType;

  @AutoMap()
  public parentExerciseId?: string;

  @AutoMap()
  public parentExerciseName?: string;

  @AutoMap()
  public numTimesUsed?: number;

  @AutoMap(() => RecentSetModel)
  public mostRecentWorkoutSets?: RecentSetModel[];
}

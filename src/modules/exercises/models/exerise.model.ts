import { AutoMap } from '@automapper/classes';
import { ExerciseType } from '../enums/exercise-type.enum';

export class ExerciseModel {
  @AutoMap()
  id: string;

  @AutoMap()
  name: string;

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
}

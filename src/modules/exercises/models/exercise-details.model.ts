import { AutoMap } from '@automapper/classes';
import { capitalizeFirstLetter } from 'src/common/utils/capitalize-first-letter.util';
import { ExerciseWorkoutHistoryModel } from './exercise-workout-history.model';
import { ExerciseModel } from './exerise.model';

export class ExerciseDetailsModel {
  @AutoMap()
  public id: string;
  @AutoMap()
  public name: string;
  @AutoMap()
  public bodyPart: string;
  @AutoMap()
  public equipment: string;
  @AutoMap()
  public isCustom: boolean;
  @AutoMap(() => ExerciseWorkoutHistoryModel)
  public workoutHistory: ExerciseWorkoutHistoryModel[];

  constructor(
    exercise: ExerciseModel,
    workoutHistory: ExerciseWorkoutHistoryModel[],
  ) {
    this.id = exercise.id;
    this.name = exercise.name;
    this.bodyPart = capitalizeFirstLetter(exercise.bodyPart);
    this.equipment = capitalizeFirstLetter(exercise.equipment);
    this.isCustom = exercise.isCustom;
    this.workoutHistory = workoutHistory;
  }
}

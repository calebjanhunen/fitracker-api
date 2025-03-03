import { AutoMap } from '@automapper/classes';
import { capitalizeFirstLetter } from 'src/common/utils/capitalize-first-letter.util';
import { ExerciseType } from '../enums/exercise-type.enum';
import { ExerciseVariationModel } from './exercise-variation.model';
import { ExerciseWorkoutHistoryModel } from './exercise-workout-history.model';
import { ExerciseModel } from './exerise.model';

export class ExerciseDetailsModel {
  @AutoMap()
  public id: string;

  @AutoMap()
  public name: string;

  @AutoMap()
  public notes?: string;

  @AutoMap()
  public bodyPart: string;

  @AutoMap()
  public equipment: string;

  @AutoMap()
  public isCustom: boolean;

  @AutoMap(() => ExerciseWorkoutHistoryModel)
  public workoutHistory: ExerciseWorkoutHistoryModel[];

  @AutoMap(() => ExerciseVariationModel)
  public exerciseVariations: ExerciseVariationModel[];

  @AutoMap()
  public parentExerciseId?: string;

  @AutoMap()
  public parentExerciseName?: string;

  @AutoMap()
  public exerciseType: ExerciseType;

  constructor(
    exercise: ExerciseModel,
    workoutHistory: ExerciseWorkoutHistoryModel[],
    exerciseVariations: ExerciseVariationModel[],
  ) {
    this.id = exercise.id;
    this.name = exercise.name;
    this.bodyPart = capitalizeFirstLetter(exercise.bodyPart);
    this.equipment = capitalizeFirstLetter(exercise.equipment);
    this.isCustom = exercise.isCustom;
    this.workoutHistory = workoutHistory;
    this.exerciseVariations = exerciseVariations;
    this.parentExerciseId = exercise.parentExerciseId;
    this.parentExerciseName = exercise.parentExerciseName;
    this.exerciseType = exercise.exerciseType;
    this.notes = exercise.notes;
  }
}

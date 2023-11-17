import { Exercise } from 'src/model';

export class ExerciseResponse {
  public id: string;
  public name: string;
  public difficultyLevel: string;
  public equipment: string;
  public instructions: string[];
  public primaryMucle: string;
  public secondaryMuscles: string[];
  public isCustom: boolean;
  public userId: string | undefined;

  public fromEntityToResponse(exercise: Exercise): ExerciseResponse {
    const exerciseResponse = new ExerciseResponse();
    exerciseResponse.id = exercise.id;
    exerciseResponse.name = exercise.name;
    exerciseResponse.difficultyLevel = exercise.difficultyLevel;
    exerciseResponse.equipment = exercise.equipment;
    exerciseResponse.instructions = exercise.instructions;
    exerciseResponse.primaryMucle = exercise.primaryMuscle;
    exerciseResponse.secondaryMuscles = exercise.secondaryMuscles;
    exerciseResponse.isCustom = exercise.isCustom;
    exerciseResponse.userId = exercise.user?.id;

    return exerciseResponse;
  }
}

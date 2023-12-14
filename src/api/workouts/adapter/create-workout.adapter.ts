import { Exercise, Set, Workout } from 'src/model';
import {
  CreateWorkoutRequest,
  ExerciseInWorkoutRequest,
  SetInExerciseRequest,
} from '../request/create-workout.request';

export class CreateWorkoutAdapter {
  /**
   *
   * @param CreateWorkoutRequest request
   * @param String userId
   * @returns {Workout}
   */
  public fromDtoToEntity(
    request: CreateWorkoutRequest,
    userId: string,
  ): Workout {
    const workoutModel = new Workout();
    workoutModel.name = request.name;
    workoutModel.exercises = [];
    workoutModel.user.id = userId;

    for (const exercise of request.exercises) {
      const exerciseModel = this.createExerciseModelFromRequest(exercise);
      workoutModel.exercises.push(exerciseModel);
    }

    return workoutModel;
  }

  private createExerciseModelFromRequest(
    request: ExerciseInWorkoutRequest,
  ): Exercise {
    const model = new Exercise();
    model.id = request.id;
    model.sets = [];

    for (const set of request.sets) {
      const setModel = this.createSetModelFromRequest(set);
      model.sets.push(setModel);
    }
    return model;
  }

  private createSetModelFromRequest(request: SetInExerciseRequest): Set {
    const model = new Set();
    model.reps = request.reps;
    model.weight = request.weight;
    model.rpe = request.rpe;
    return model;
  }
}

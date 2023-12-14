import { Exercise, Set, User, Workout } from 'src/model';
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
    workoutModel.user = new User();
    workoutModel.user.id = userId;

    if (!request.exercises) {
      return workoutModel;
    }

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
      const setModel = this.createSetModelFromRequest(set, model);
      model.sets.push(setModel);
    }
    return model;
  }

  private createSetModelFromRequest(
    request: SetInExerciseRequest,
    exercise: Exercise,
  ): Set {
    const model = new Set();
    model.reps = request.reps;
    model.weight = request.weight;
    model.rpe = request.rpe;
    model.exercise = exercise;
    return model;
  }
}

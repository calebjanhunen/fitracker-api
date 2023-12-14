import { Exercise, Set, Workout } from 'src/model';
import {
  ExerciseResponseInWorkout,
  SetResponseInExercise,
  WorkoutResponse,
} from '../response/workout.response';

export class WorkoutResponseAdapter {
  public fromEntityToResponse(workout: Workout): WorkoutResponse {
    const workoutResponse = new WorkoutResponse();
    workoutResponse.id = workout.id;
    workoutResponse.dateCreated = workout.createdAt;
    workoutResponse.name = workout.name;
    workoutResponse.exercises = [];

    for (const exerciseModel of workout.exercises) {
      const exerciseResponse =
        this.createExerciseResponseFromExerciseModel(exerciseModel);
      workoutResponse.exercises.push(exerciseResponse);
    }

    return workoutResponse;
  }

  private createExerciseResponseFromExerciseModel(
    exercise: Exercise,
  ): ExerciseResponseInWorkout {
    const exerciseResponse = new ExerciseResponseInWorkout();
    exerciseResponse.id = exercise.id;
    exerciseResponse.name = exercise.name;
    exerciseResponse.sets = [];

    for (const setModel of exercise.sets) {
      const setResponse = this.createSetResponseFromSetModel(setModel);
      exerciseResponse.sets.push(setResponse);
    }

    return exerciseResponse;
  }

  private createSetResponseFromSetModel(set: Set): SetResponseInExercise {
    const setResponse = new SetResponseInExercise();
    setResponse.id = set.id;
    setResponse.reps = set.reps;
    setResponse.weight = set.weight;
    setResponse.rpe = set.rpe;
    return setResponse;
  }
}

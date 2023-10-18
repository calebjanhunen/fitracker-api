import { Exercise, Set, User, Workout } from 'src/model';
import { CreateWorkoutRequest } from '../request/create-workout.request';

export class CreateWorkoutAdapter {
  /**
   *
   * @param CreateWorkoutRequest workoutDto
   * @param String userId
   * @returns Workout
   */
  public fromDtoToEntity(
    workoutDto: CreateWorkoutRequest,
    userId: string,
  ): Workout {
    const workoutModel = new Workout();
    workoutModel.exercises = [];
    workoutModel.sets = [];

    workoutModel.name = workoutDto.name;

    const user = new User();
    user.id = userId;
    workoutModel.user = user;

    for (const exercise of workoutDto.exercises) {
      const newExercise = new Exercise();
      newExercise.id = exercise.id;
      workoutModel.exercises.push(newExercise);
      for (const set of exercise.sets) {
        const newSet = new Set();
        newSet.reps = set.reps;
        newSet.weight = set.weight;
        newSet.rpe = set.rpe;
        newSet.exercise = newExercise;
        workoutModel.sets.push(newSet);
      }
    }

    return workoutModel;
  }
}

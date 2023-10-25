import { Workout } from 'src/model';
import { WorkoutResponse } from '../response/workout.response';

export class WorkoutResponseAdapter {
  public fromEntityToResponse(workout: Workout): WorkoutResponse {
    const response = new WorkoutResponse();
    response.id = workout.id;
    response.dateCreated = workout.createdAt;
    response.name = workout.name;
    response.exercises = [];

    for (const exercise of workout.exercises) {
      response.exercises.push({
        id: exercise.id,
        name: exercise.name,
        sets: [],
      });
    }

    response.exercises = response.exercises.map((exercise) => {
      const sets = [];
      for (const set of workout.sets) {
        if (set.exercise.id === exercise.id) {
          sets.push({ weight: set.weight, reps: set.reps, rpe: set.rpe });
        }
      }
      return { ...exercise, sets };
    });
    return response;
  }
}

import { Exercise, Set, User, Workout } from 'src/model';
import { WorkoutResponseAdapter } from './workout-response.adapter';

describe('WorkoutResponseAdapter', () => {
  const workoutResponseAdapter = new WorkoutResponseAdapter();

  it('should convert workout entity to workout response', () => {
    const exercise1 = new Exercise();
    exercise1.id = 'exercise-1';
    exercise1.name = 'Exercise 1';
    exercise1.sets = [getSetModel(120, 12, 10), getSetModel(100, 10, 10)];
    const exercise2 = new Exercise();
    exercise2.id = 'exercise-2';
    exercise2.name = 'Exercise 2';
    exercise2.sets = [getSetModel(122, 11, 9), getSetModel(100, 11, 10)];
    const workout: Workout = {
      id: 'workout-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      user: new User(),
      name: 'Test Workout',
      exercises: [exercise1, exercise2],
    };

    const result = workoutResponseAdapter.fromEntityToResponse(workout);

    expect(result.id).toEqual(workout.id);
    expect(result.name).toEqual(workout.name);
    expect(result.dateCreated).toEqual(workout.createdAt);
    expect(result.exercises).toEqual(workout.exercises);
    expect(result.exercises[0].sets).toEqual(workout.exercises[0].sets);
    expect(result.exercises[1].sets).toEqual(workout.exercises[1].sets);
  });
});

function getSetModel(reps: number, weight: number, rpe: number): Set {
  const set = new Set();
  set.reps = reps;
  set.weight = weight;
  set.rpe = rpe;
  return set;
}

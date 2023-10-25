import { Exercise, Set, User, Workout } from 'src/model';
import { WorkoutResponse } from '../response/workout.response';
import { WorkoutResponseAdapter } from './workout-response.adapter';

describe('WorkoutResponseAdapter', () => {
  const workoutResponseAdapter = new WorkoutResponseAdapter();

  it('should convert workout entity to workout response', () => {
    const workout: Workout = {
      id: 'workout-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      user: new User(),
      name: 'Test Workout',
      exercises: [
        { ...new Exercise(), id: 'exercise-1', name: 'Exercise 1' },
        { ...new Exercise(), id: 'exercise-2', name: 'Exercise 2' },
      ],
      sets: [
        {
          ...new Set(),
          exercise: { ...new Exercise(), id: 'exercise-1', name: 'Exercise 1' },
          weight: 50,
          reps: 10,
          rpe: 7,
        },
        {
          ...new Set(),
          exercise: { ...new Exercise(), id: 'exercise-1', name: 'Exercise 1' },
          weight: 60,
          reps: 12,
          rpe: 8,
        },
        {
          ...new Set(),
          exercise: { ...new Exercise(), id: 'exercise-2', name: 'Exercise 2' },
          weight: 40,
          reps: 8,
          rpe: 6,
        },
      ],
    };

    const workoutResponse: WorkoutResponse = {
      name: 'Test Workout',
      id: 'workout-1',
      dateCreated: workout.createdAt,
      exercises: [
        {
          id: 'exercise-1',
          name: 'Exercise 1',
          sets: [
            { weight: 50, reps: 10, rpe: 7 },
            { weight: 60, reps: 12, rpe: 8 },
          ],
        },
        {
          id: 'exercise-2',
          name: 'Exercise 2',
          sets: [{ weight: 40, reps: 8, rpe: 6 }],
        },
      ],
    };

    const result = workoutResponseAdapter.fromEntityToResponse(workout);

    expect(result).toEqual(workoutResponse);
  });
});

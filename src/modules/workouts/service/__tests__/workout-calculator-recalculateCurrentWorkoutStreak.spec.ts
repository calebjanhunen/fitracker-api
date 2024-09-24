import { WorkoutModel } from '../../models';
import { WorkoutCalculator } from '../workout.calculator';

describe('WorkoutCalculator: getDifferenceInDays', () => {
  const workoutCalculator = new WorkoutCalculator();

  it('should return 0 if remaining workouts is empty', () => {
    const remainingWorkouts: WorkoutModel[] = [];

    const newWorkoutStreak =
      workoutCalculator.recalculateCurrentWorkoutStreak(remainingWorkouts);

    expect(newWorkoutStreak).toBe(0);
  });

  it('should return 0 if the latest workout is more than 1 day before today', () => {
    const remainingWorkouts: WorkoutModel[] = [
      getWorkoutModelNDaysBeforeToday(2),
      getWorkoutModelNDaysBeforeToday(3),
      getWorkoutModelNDaysBeforeToday(4),
      getWorkoutModelNDaysBeforeToday(5),
    ];

    const newWorkoutStreak =
      workoutCalculator.recalculateCurrentWorkoutStreak(remainingWorkouts);

    expect(newWorkoutStreak).toBe(0);
  });

  it('should return 2 if there are 2 consecutive workouts with the first one being less than 2 days before today', () => {
    const remainingWorkouts: WorkoutModel[] = [
      getWorkoutModelNDaysBeforeToday(1),
      getWorkoutModelNDaysBeforeToday(2),
      getWorkoutModelNDaysBeforeToday(4),
      getWorkoutModelNDaysBeforeToday(5),
    ];

    const newWorkoutStreak =
      workoutCalculator.recalculateCurrentWorkoutStreak(remainingWorkouts);

    expect(newWorkoutStreak).toBe(2);
  });
  it('should return 1', () => {
    const remainingWorkouts: WorkoutModel[] = [
      getWorkoutModelNDaysBeforeToday(0),
      getWorkoutModelNDaysBeforeToday(2),
      getWorkoutModelNDaysBeforeToday(4),
      getWorkoutModelNDaysBeforeToday(5),
    ];

    const newWorkoutStreak =
      workoutCalculator.recalculateCurrentWorkoutStreak(remainingWorkouts);

    expect(newWorkoutStreak).toBe(1);
  });
  it('should return 8', () => {
    const remainingWorkouts: WorkoutModel[] = [
      getWorkoutModelNDaysBeforeToday(0),
      getWorkoutModelNDaysBeforeToday(1),
      getWorkoutModelNDaysBeforeToday(2),
      getWorkoutModelNDaysBeforeToday(3),
      getWorkoutModelNDaysBeforeToday(4),
      getWorkoutModelNDaysBeforeToday(5),
      getWorkoutModelNDaysBeforeToday(6),
      getWorkoutModelNDaysBeforeToday(7),
    ];

    const newWorkoutStreak =
      workoutCalculator.recalculateCurrentWorkoutStreak(remainingWorkouts);

    expect(newWorkoutStreak).toBe(8);
  });
  it('should handle multiple workouts on the same day', () => {
    const remainingWorkouts: WorkoutModel[] = [
      getWorkoutModelNDaysBeforeToday(0),
      getWorkoutModelNDaysBeforeToday(0),
      getWorkoutModelNDaysBeforeToday(1),
      getWorkoutModelNDaysBeforeToday(2),
      getWorkoutModelNDaysBeforeToday(2),
      getWorkoutModelNDaysBeforeToday(2),
      getWorkoutModelNDaysBeforeToday(3),
      getWorkoutModelNDaysBeforeToday(4),
    ];

    const newWorkoutStreak =
      workoutCalculator.recalculateCurrentWorkoutStreak(remainingWorkouts);

    expect(newWorkoutStreak).toBe(5);
  });
});

function getWorkoutModelNDaysBeforeToday(n: number): WorkoutModel {
  const today = new Date();
  const nDaysAgo = new Date(today);
  nDaysAgo.setDate(today.getDate() - n);

  const model = new WorkoutModel();
  model.createdAt = nDaysAgo.toISOString();
  return model;
}

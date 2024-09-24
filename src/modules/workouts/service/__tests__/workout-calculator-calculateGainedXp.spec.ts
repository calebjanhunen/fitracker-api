import { InsertWorkoutModel } from '../../models';
import { WorkoutCalculator } from '../workout.calculator';

describe('WorkoutCalculator: calculateGainedXp', () => {
  const workoutCalculator = new WorkoutCalculator();

  it('should return base xp if nothing else contributes to xp gain', () => {
    const workout = new InsertWorkoutModel();
    workout.duration = 899;

    const {
      totalGainedXp,
      baseXpGain,
      xpGainedFromWorkoutDuration,
      xpGainedFromWorkoutStreak,
    } = workoutCalculator.calculateGainedXp(workout, 2);

    expect(totalGainedXp).toBe(50);
    expect(baseXpGain).toBe(50);
    expect(xpGainedFromWorkoutDuration).toBe(0);
    expect(xpGainedFromWorkoutStreak).toBe(0);
  });

  it('testing xp gain from base xp and workout duration xp', () => {
    const workout = new InsertWorkoutModel();
    workout.duration = 1000;

    const {
      totalGainedXp,
      baseXpGain,
      xpGainedFromWorkoutDuration,
      xpGainedFromWorkoutStreak,
    } = workoutCalculator.calculateGainedXp(workout, 2);

    expect(totalGainedXp).toBe(210);
    expect(baseXpGain).toBe(50);
    expect(xpGainedFromWorkoutDuration).toBe(160);
    expect(xpGainedFromWorkoutStreak).toBe(0);
  });

  it('testing xp gain from base xp and workout streak xp', () => {
    const workout = new InsertWorkoutModel();
    workout.duration = 100;
    const streak = 5;

    const {
      totalGainedXp,
      baseXpGain,
      xpGainedFromWorkoutDuration,
      xpGainedFromWorkoutStreak,
    } = workoutCalculator.calculateGainedXp(workout, streak);

    expect(totalGainedXp).toBe(80);
    expect(baseXpGain).toBe(50);
    expect(xpGainedFromWorkoutDuration).toBe(0);
    expect(xpGainedFromWorkoutStreak).toBe(30);
  });
});

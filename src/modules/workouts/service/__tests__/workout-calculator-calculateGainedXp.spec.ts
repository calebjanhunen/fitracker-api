import { InsertWorkoutModel } from '../../models';
import { WorkoutCalculator } from '../workout.calculator';

describe('WorkoutCalculator: calculateGainedXp', () => {
  const workoutCalculator = new WorkoutCalculator();

  it('should return base xp if nothing else contributes to xp gain', () => {
    const workout = new InsertWorkoutModel();
    workout.duration = 899;

    const xpGain = workoutCalculator.calculateGainedXp(workout, 2);

    expect(xpGain).toBe(50);
  });

  it('testing xp gain from base xp and workout duration xp', () => {
    const workout = new InsertWorkoutModel();
    workout.duration = 1000;

    const xpGain = workoutCalculator.calculateGainedXp(workout, 2);

    expect(xpGain).toBe(50 + 160);
  });

  it('testing xp gain from base xp and workout streak xp', () => {
    const workout = new InsertWorkoutModel();
    workout.duration = 100;
    const streak = 5;

    const xpGain = workoutCalculator.calculateGainedXp(workout, streak);

    expect(xpGain).toBe(50 + 30);
  });
});

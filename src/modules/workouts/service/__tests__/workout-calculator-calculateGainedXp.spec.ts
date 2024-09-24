import { InsertWorkoutModel } from '../../models';
import { WorkoutCalculator } from '../workout.calculator';

describe('WorkoutCalculator: calculateGainedXp', () => {
  const workoutCalculator = new WorkoutCalculator();

  it('should return base xp gain if workout is less than 15 mins', () => {
    const workout = new InsertWorkoutModel();
    workout.duration = 899;

    const xpGain = workoutCalculator.calculateGainedXp(workout);

    expect(xpGain).toBe(50);
  });

  it('should return correct xp gain if workout is greater than 15 mins', () => {
    const workout = new InsertWorkoutModel();
    workout.duration = 123858923235;

    const xpGain = workoutCalculator.calculateGainedXp(workout);

    expect(xpGain).toBe(20643153920);
  });
});

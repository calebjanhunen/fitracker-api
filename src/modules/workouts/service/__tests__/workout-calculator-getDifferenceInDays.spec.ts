import { WorkoutCalculator } from '../workout.calculator';

describe('WorkoutCalculator: getDifferenceInDays', () => {
  const workoutCalculator = new WorkoutCalculator();

  it('should return 1 if the Dates are 1 day apart', () => {
    const date1 = new Date('2024-09-24T00:11:37+0000');
    const date2 = new Date('2024-09-25T00:16:37+0000');

    const difference = workoutCalculator.getDifferenceInDays(date1, date2);
    expect(difference).toBe(1);
  });
  it('should return 1 if Dates are under 24 hours apart but on differnt days', () => {
    const date1 = new Date('2024-09-24T00:23:37+0000');
    const date2 = new Date('2024-09-25T00:08:37+0000');

    const difference = workoutCalculator.getDifferenceInDays(date1, date2);
    expect(difference).toBe(1);
  });
  it('should return 0 if Dates are the same day', () => {
    const date1 = new Date('2024-09-24T00:08:37+0000');
    const date2 = new Date('2024-09-24T00:16:23+0000');

    const difference = workoutCalculator.getDifferenceInDays(date1, date2);
    expect(difference).toBe(0);
  });
  it('should return 5 if Dates are 5 days apart', () => {
    const date1 = new Date('2024-09-24T00:11:37+0000');
    const date2 = new Date('2024-09-29T00:16:37+0000');

    const difference = workoutCalculator.getDifferenceInDays(date1, date2);
    expect(difference).toBe(5);
  });
});

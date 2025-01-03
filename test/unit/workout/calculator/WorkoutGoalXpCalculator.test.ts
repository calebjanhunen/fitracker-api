import { WorkoutGoalXpCalculator } from 'src/modules/workouts/calculator/WorkoutGoalXpCalculator';

describe('WorkoutGoalXpCalculator', () => {
  const workoutGoalXpCalculator = new WorkoutGoalXpCalculator();

  describe('calculateWorkoutGoalXp', () => {
    it('GivenWorkoutGoalOf3AndDaysWithWorkoutsThisWeekEqualingWorkoutGoal_WhenCalculatingWorkoutGoalXp_ReturnCorrectXpValue', () => {
      const userWorkoutgoal = 3;
      const daysWithWorkoutsThisWeek = 3;

      const actual = workoutGoalXpCalculator.calculateWorkoutGoalXp(
        userWorkoutgoal,
        daysWithWorkoutsThisWeek,
      );

      expect(actual).toBe(40);
    });
    it('GivenWorkoutGoalOf4AndDaysWithWorkoutsThisWeekEqualingWorkoutGoal_WhenCalculatingWorkoutGoalXp_ReturnCorrectXpValue', () => {
      const userWorkoutgoal = 4;
      const daysWithWorkoutsThisWeek = 4;

      const actual = workoutGoalXpCalculator.calculateWorkoutGoalXp(
        userWorkoutgoal,
        daysWithWorkoutsThisWeek,
      );

      expect(actual).toBe(45);
    });
    it('GivenWorkoutGoalOf5AndDaysWithWorkoutsThisWeekEqualingWorkoutGoal_WhenCalculatingWorkoutGoalXp_ReturnCorrectXpValue', () => {
      const userWorkoutgoal = 5;
      const daysWithWorkoutsThisWeek = 5;

      const actual = workoutGoalXpCalculator.calculateWorkoutGoalXp(
        userWorkoutgoal,
        daysWithWorkoutsThisWeek,
      );

      expect(actual).toBe(50);
    });
    it('GivenWorkoutGoalOf6AndDaysWithWorkoutsThisWeekEqualingWorkoutGoal_WhenCalculatingWorkoutGoalXp_ReturnCorrectXpValue', () => {
      const userWorkoutgoal = 6;
      const daysWithWorkoutsThisWeek = 6;

      const actual = workoutGoalXpCalculator.calculateWorkoutGoalXp(
        userWorkoutgoal,
        daysWithWorkoutsThisWeek,
      );

      expect(actual).toBe(55);
    });
    it('GivenDaysWithWorkoutsThisWeekGreaterThanGoal_WhenCalculatingWOrkoutGoalXp_ReturnCorrectXpValue', () => {
      const userWorkoutgoal = 6;
      const daysWithWorkoutsThisWeek = 8;

      const actual = workoutGoalXpCalculator.calculateWorkoutGoalXp(
        userWorkoutgoal,
        daysWithWorkoutsThisWeek,
      );

      expect(actual).toBe(61);
    });
  });
});

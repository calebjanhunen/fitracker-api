import { WorkoutGoalXpCalculator } from 'src/modules/workouts/calculator/WorkoutGoalXpCalculator';

describe('WorkoutGoalXpCalculator', () => {
  const workoutGoalXpCalculator = new WorkoutGoalXpCalculator();

  describe('calculateWorkoutGoalXp', () => {
    it('GivenWorkoutGoalOf3_WhenCalculatingWorkoutGoalXp_ReturnCorrectXpValue', () => {
      const userWorkoutgoal = 3;

      const actual =
        workoutGoalXpCalculator.calculateWorkoutGoalXp(userWorkoutgoal);

      expect(actual).toBe(40);
    });
    it('GivenWorkoutGoalOf4_WhenCalculatingWorkoutGoalXp_ReturnCorrectXpValue', () => {
      const userWorkoutgoal = 4;

      const actual =
        workoutGoalXpCalculator.calculateWorkoutGoalXp(userWorkoutgoal);

      expect(actual).toBe(45);
    });
    it('GivenWorkoutGoalOf5_WhenCalculatingWorkoutGoalXp_ReturnCorrectXpValue', () => {
      const userWorkoutgoal = 5;

      const actual =
        workoutGoalXpCalculator.calculateWorkoutGoalXp(userWorkoutgoal);

      expect(actual).toBe(50);
    });
    it('GivenWorkoutGoalOf6_WhenCalculatingWorkoutGoalXp_ReturnCorrectXpValue', () => {
      const userWorkoutgoal = 6;

      const actual =
        workoutGoalXpCalculator.calculateWorkoutGoalXp(userWorkoutgoal);

      expect(actual).toBe(55);
    });
  });
});

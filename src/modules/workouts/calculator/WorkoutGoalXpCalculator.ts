export class WorkoutGoalXpCalculator {
  private readonly BASE_GOAL_XP = 25;
  private readonly GOAL_XP_MULTIPLIER = 5;
  constructor() {}

  public calculateWorkoutGoalXp(userWorkoutGoal: number) {
    /**
     * goal xp = base xp + (goal * multiplier)
     */
    return this.BASE_GOAL_XP + userWorkoutGoal * this.GOAL_XP_MULTIPLIER;
  }
}

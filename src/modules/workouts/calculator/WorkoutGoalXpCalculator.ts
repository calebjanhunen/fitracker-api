import { Injectable } from '@nestjs/common';

@Injectable()
export class WorkoutGoalXpCalculator {
  private readonly BASE_GOAL_XP = 25;
  private readonly BASE_GOAL_STREAK_XP = 30;
  private readonly GOAL_XP_MULTIPLIER = 5;
  private readonly BONUS_XP_MULTIPLIER = 3;
  private readonly GOAL_STREAK_FACTOR = 1.2;
  constructor() {}

  public calculateWorkoutGoalXp(
    userWorkoutGoal: number,
    daysWithWorkoutsThisWeek: number,
  ): number {
    if (userWorkoutGoal === 0) {
      return 0;
    }

    const workoutGoalBaseXp = this.calculateWorkoutGoalBaseXp(userWorkoutGoal);
    const bonusXp = this.calculateBonusXp(
      userWorkoutGoal,
      daysWithWorkoutsThisWeek,
    );
    return workoutGoalBaseXp + bonusXp;
  }

  public calculateWorkoutGoalStreakXp(
    workoutGoalStreak: number,
    userWorkoutGoal: number,
  ): number {
    if (workoutGoalStreak === 1) {
      return 0;
    }

    const baseStreakXp =
      this.BASE_GOAL_STREAK_XP * this.GOAL_STREAK_FACTOR ** workoutGoalStreak;
    const bonusXp = userWorkoutGoal * this.GOAL_XP_MULTIPLIER;

    const xp = Math.round(baseStreakXp + bonusXp);

    // cap xp at 200 ... for now
    return xp > 200 ? 200 : xp;
  }

  private calculateWorkoutGoalBaseXp(userWorkoutGoal: number): number {
    return this.BASE_GOAL_XP + userWorkoutGoal * this.GOAL_XP_MULTIPLIER;
  }

  private calculateBonusXp(
    userWorkoutGoal: number,
    daysWithWorkoutsThisWeek: number,
  ): number {
    return (
      (daysWithWorkoutsThisWeek - userWorkoutGoal) * this.BONUS_XP_MULTIPLIER
    );
  }
}

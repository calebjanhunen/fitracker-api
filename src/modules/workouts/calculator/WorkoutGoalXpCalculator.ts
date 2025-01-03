import { Injectable } from '@nestjs/common';

@Injectable()
export class WorkoutGoalXpCalculator {
  private readonly BASE_GOAL_XP = 25;
  private readonly GOAL_XP_MULTIPLIER = 5;
  private readonly BONUS_XP_MULTIPLIER = 3;
  constructor() {}

  public calculateWorkoutGoalXp(
    userWorkoutGoal: number,
    daysWithWorkoutsThisWeek: number,
  ): number {
    const workoutGoalBaseXp = this.calculateWorkoutGoalBaseXp(userWorkoutGoal);
    const bonusXp = this.calculateBonusXp(
      userWorkoutGoal,
      daysWithWorkoutsThisWeek,
    );
    return workoutGoalBaseXp + bonusXp;
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

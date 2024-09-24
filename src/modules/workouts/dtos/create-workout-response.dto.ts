export class CreateWorkoutResponseDto {
  workoutId: string;
  currentWorkoutStreak: number;
  baseXpGain: number;
  xpGainedFromWorkoutDuration: number;
  xpGainedFromWorkoutStreak: number;
  totalXpGained: number;
  totalUserXp: number;
}

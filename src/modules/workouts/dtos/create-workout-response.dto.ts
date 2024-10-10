import { WorkoutResponseDto } from './workout-response.dto';

export class CreateWorkoutResponseDto {
  workout: WorkoutResponseDto;
  workoutStats: WorkoutStatsDto;
}

class WorkoutStatsDto {
  xpGainedFromWeeklyGoal: number;
  totalGainedXp: number;
  totalUserXp: number;
}

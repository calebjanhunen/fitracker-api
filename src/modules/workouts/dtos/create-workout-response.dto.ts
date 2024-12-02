import { WorkoutResponseDto } from './workout-response.dto';

export class CreateWorkoutResponseDto {
  workout: WorkoutResponseDto;
  workoutStats: WorkoutStatsDto;
}

class WorkoutStatsDto {
  totalWorkoutXp: number;
  workoutEffortXp: number;
}

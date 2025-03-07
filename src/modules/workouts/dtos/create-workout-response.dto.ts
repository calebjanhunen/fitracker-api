import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { WorkoutResponseDto } from './workout-response.dto';

export class WorkoutStatsDto {
  @ApiProperty()
  @AutoMap()
  totalWorkoutXp: number;
  @ApiProperty()
  @AutoMap()
  workoutEffortXp: number;
  @ApiProperty()
  @AutoMap()
  workoutGoalXp: number;
  @ApiProperty()
  @AutoMap()
  workoutGoalStreakXp: number;
}

export class UserStatsBeforeWorkoutDto {
  @ApiProperty({ type: Number, required: true })
  @AutoMap()
  level: number;

  @ApiProperty({ type: Number, required: true })
  @AutoMap()
  currentXp: number;
}

export class UserStatsAfterWorkoutDto {
  @ApiProperty({ type: Number, required: true })
  @AutoMap()
  level: number;

  @ApiProperty({ type: Number, required: true })
  @AutoMap()
  currentXp: number;

  @ApiProperty({ type: Number, required: true })
  @AutoMap()
  xpNeededForCurrentLevel: number;

  @ApiProperty({ type: Number, required: true })
  @AutoMap()
  daysWithWorkoutsThisWeek: number;

  @ApiProperty({ type: Boolean, required: true })
  @AutoMap()
  hasWeeklyGoalAlreadyBeenAchieved: boolean;
}

export class CreateWorkoutResponseDto {
  @ApiProperty()
  @AutoMap()
  workout: WorkoutResponseDto;

  @ApiProperty()
  @AutoMap(() => WorkoutStatsDto)
  workoutStats: WorkoutStatsDto;

  @ApiProperty({ type: UserStatsBeforeWorkoutDto, required: true })
  @AutoMap()
  userStatsBeforeWorkout: UserStatsBeforeWorkoutDto;

  @ApiProperty({ type: UserStatsAfterWorkoutDto, required: true })
  @AutoMap()
  userStatsAfterWorkout: UserStatsAfterWorkoutDto;
}

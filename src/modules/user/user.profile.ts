import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { UpdateWeeklyWorkoutGoalDto } from './dtos/update-weekly-workout-goal.dto';
import { UserStatsResponseDto } from './dtos/user-stats-response.dto';
import { UserStats } from './models/user-stats.model';

@Injectable()
export class UserProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, UpdateWeeklyWorkoutGoalDto, UserStats);
      createMap(mapper, UserStats, UserStatsResponseDto);
    };
  }
}

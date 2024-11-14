import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Body, ConflictException, Controller, Patch } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators';
import { UpdateWeeklyWorkoutGoalDto } from '../dtos/update-weekly-workout-goal.dto';
import { UserStatsResponseDto } from '../dtos/user-stats-response.dto';
import { UserStats } from '../models/user-stats.model';
import { UserService } from '../service/user.service';

@Controller('/api/users')
export class UserController {
  private userService;

  constructor(
    userService: UserService,
    @InjectMapper() private mapper: Mapper,
  ) {
    this.userService = userService;
  }

  @Patch()
  public async updateWeeklyWorkoutGoal(
    @Body() dto: UpdateWeeklyWorkoutGoalDto,
    @CurrentUser() userId: string,
  ): Promise<UserStatsResponseDto> {
    try {
      const model = this.mapper.map(dto, UpdateWeeklyWorkoutGoalDto, UserStats);
      const result = await this.userService.updateUserStats(userId, model);
      return this.mapper.map(result, UserStats, UserStatsResponseDto);
    } catch (e) {
      throw new ConflictException(e.message);
    }
  }
}

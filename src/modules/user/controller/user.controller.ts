import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Body,
  ConflictException,
  Controller,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UpdateWeeklyWorkoutGoalDto } from '../dtos/update-weekly-workout-goal.dto';
import { UserStatsResponseDto } from '../dtos/user-stats-response.dto';
import { UserStats } from '../models/user-stats.model';
import { UserService } from '../service/user.service';

@Controller('/api/users')
@UseGuards(JwtAuthGuard)
@ApiTags('Users')
@ApiBearerAuth('access-token')
export class UserController {
  private userService;

  constructor(
    userService: UserService,
    @InjectMapper() private mapper: Mapper,
  ) {
    this.userService = userService;
  }

  @Patch()
  @ApiResponse({ status: HttpStatus.OK, type: UserStatsResponseDto })
  @ApiResponse({ status: HttpStatus.CONFLICT })
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

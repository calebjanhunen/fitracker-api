import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Body,
  ConflictException,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { UpdateWeeklyWorkoutGoalDto } from '../dtos/update-weekly-workout-goal.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { UserStatsResponseDto } from '../dtos/user-stats-response.dto';
import { UserStats } from '../models/user-stats.model';
import { UserService } from '../service/user.service';

@Controller('/api/users')
@UseGuards(AuthGuard)
export class UserController {
  private userService;

  constructor(
    userService: UserService,
    @InjectMapper() private mapper: Mapper,
  ) {
    this.userService = userService;
  }

  @Get('')
  public async getUserById(
    @Headers('user-id') userId: string,
  ): Promise<UserResponseDto> {
    try {
      const user = await this.userService.findById(userId);
      return plainToInstance(UserResponseDto, user);
    } catch (e) {
      if (e instanceof ResourceNotFoundException) {
        throw new NotFoundException(e.message);
      }
      throw new ConflictException(e.message);
    }
  }

  @Patch()
  public async updateWeeklyWorkoutGoal(
    @Body() dto: UpdateWeeklyWorkoutGoalDto,
    @Headers('user-id') userId: string,
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

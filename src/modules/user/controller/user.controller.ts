import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { UpdateWeeklyWorkoutGoalDto } from '../dtos/update-weekly-workout-goal.dto';
import { UserProfileDto } from '../dtos/user-profile.dto';
import { UserProfileModel } from '../models/user-profile.model';
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

  @Get('me')
  @ApiResponse({ status: HttpStatus.OK, type: UserProfileDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR })
  public async getCurrentUser(
    @CurrentUser() userId: string,
  ): Promise<UserProfileDto> {
    try {
      const user = await this.userService.getCurrentUser(userId);
      return this.mapper.map(user, UserProfileModel, UserProfileDto);
    } catch (e) {
      if (e instanceof ResourceNotFoundException) {
        throw new NotFoundException(e);
      }
      throw new InternalServerErrorException(e);
    }
  }

  @Patch()
  @ApiResponse({ status: HttpStatus.OK, type: UserProfileDto })
  @ApiResponse({ status: HttpStatus.CONFLICT })
  public async updateWeeklyWorkoutGoal(
    @Body() dto: UpdateWeeklyWorkoutGoalDto,
    @CurrentUser() userId: string,
  ): Promise<UserProfileDto> {
    try {
      const userProfile = await this.userService.updateWeeklyWorkoutGoal(
        dto.weeklyWorkoutGoal,
        userId,
      );
      return this.mapper.map(userProfile, UserProfileModel, UserProfileDto);
    } catch (e) {
      throw new ConflictException(e.message);
    }
  }
}

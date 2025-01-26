import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import {
  CreateWorkoutResponseDto,
  DeleteWorkoutDto,
  WorkoutRequestDto,
  WorkoutResponseDto,
  WorkoutSummaryDto,
} from '../dtos';
import { DeleteWorkout } from '../interfaces';
import {
  CreateWorkout,
  InsertWorkoutModel,
  WorkoutModel,
  WorkoutSummaryModel,
} from '../models';
import {
  CreateWorkoutService,
  GetWorkoutService,
  WorkoutService,
} from '../service';

@Controller('api/workouts')
@UseGuards(JwtAuthGuard)
@ApiTags('Workouts')
@ApiBearerAuth('access-token')
export class WorkoutController {
  constructor(
    private readonly workoutService: WorkoutService,
    private readonly createWorkoutService: CreateWorkoutService,
    private readonly getWorkoutService: GetWorkoutService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Post()
  @ApiResponse({ status: HttpStatus.CREATED, type: CreateWorkoutResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  @ApiResponse({ status: HttpStatus.CONFLICT })
  async createWorkout(
    @Body() createWorkoutDto: WorkoutRequestDto,
    @CurrentUser() userId: string,
  ): Promise<CreateWorkoutResponseDto> {
    try {
      const workout = this.mapper.map(
        createWorkoutDto,
        WorkoutRequestDto,
        InsertWorkoutModel,
      );
      const response = await this.createWorkoutService.createWorkout(
        workout,
        userId,
      );
      return this.mapper.map(response, CreateWorkout, CreateWorkoutResponseDto);
    } catch (e) {
      if (e instanceof ResourceNotFoundException) {
        throw new NotFoundException(e.message);
      }
      throw new ConflictException(e.message);
    }
  }

  @Get('/workoutSummaries')
  @ApiResponse({
    status: HttpStatus.OK,
    type: WorkoutSummaryDto,
    isArray: true,
  })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR })
  public async getWorkoutSummaries(
    @CurrentUser() userId: string,
  ): Promise<WorkoutSummaryDto[]> {
    const workoutSummaries =
      await this.getWorkoutService.getWorkoutSummaries(userId);
    return this.mapper.mapArray(
      workoutSummaries,
      WorkoutSummaryModel,
      WorkoutSummaryDto,
    );
  }

  @Get(':id')
  @ApiResponse({ status: HttpStatus.OK, type: WorkoutResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  async getWorkoutById(
    @CurrentUser() userId: string,
    @Param('id') workoutId: string,
  ): Promise<WorkoutResponseDto> {
    try {
      const workout = await this.workoutService.findById(workoutId, userId);
      return this.mapper.map(workout, WorkoutModel, WorkoutResponseDto);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Use /workouts/workoutSummaries instead',
    deprecated: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: WorkoutResponseDto,
    isArray: true,
  })
  @ApiResponse({ status: HttpStatus.CONFLICT })
  async getAllWorkouts(
    @CurrentUser() userId: string,
  ): Promise<WorkoutResponseDto[]> {
    try {
      const workouts = await this.workoutService.findAll(userId);
      return this.mapper.mapArray(workouts, WorkoutModel, WorkoutResponseDto);
    } catch (e) {
      throw new ConflictException(e.message);
    }
  }

  @Delete(':id')
  @ApiResponse({ status: HttpStatus.OK, type: DeleteWorkoutDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  @ApiResponse({ status: HttpStatus.CONFLICT })
  async deleteWorkout(
    @CurrentUser() userId: string,
    @Param('id') workoutId: string,
  ): Promise<DeleteWorkoutDto> {
    try {
      const response = await this.workoutService.delete(workoutId, userId);
      return this.mapper.map(response, DeleteWorkout, DeleteWorkoutDto);
    } catch (e) {
      if (e instanceof ResourceNotFoundException) {
        throw new NotFoundException(e.message);
      }

      throw new ConflictException(e.message);
    }
  }

  @Put(':id')
  @ApiResponse({ status: HttpStatus.OK, type: WorkoutResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  @ApiResponse({ status: HttpStatus.CONFLICT })
  async updateWorkout(
    @CurrentUser() userId: string,
    @Param('id') workoutId: string,
    @Body() updateWorkoutDto: WorkoutRequestDto,
  ): Promise<WorkoutResponseDto> {
    const workoutModel = this.mapper.map(
      updateWorkoutDto,
      WorkoutRequestDto,
      InsertWorkoutModel,
    );
    try {
      const updatedWorkout = await this.workoutService.update(
        workoutId,
        userId,
        workoutModel,
      );
      return this.mapper.map(updatedWorkout, WorkoutModel, WorkoutResponseDto);
    } catch (e) {
      if (e instanceof ResourceNotFoundException) {
        throw new NotFoundException(e.message);
      }
      throw new ConflictException(e.message);
    }
  }
}

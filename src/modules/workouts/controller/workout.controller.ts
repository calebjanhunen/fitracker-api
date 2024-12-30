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
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { CreateWorkoutResponseDto } from '../dtos/create-workout-response.dto';
import { DeleteWorkoutDto } from '../dtos/delete-workout-response.dto';
import { WorkoutRequestDto } from '../dtos/workout-request.dto';
import { WorkoutResponseDto } from '../dtos/workout-response.dto';
import { DeleteWorkout } from '../interfaces/delete-workout.interface';
import { InsertWorkoutModel, WorkoutModel } from '../models';
import { CreateWorkout } from '../models/create-workout';
import { WorkoutService } from '../service/workout.service';

@Controller('api/workouts')
@UseGuards(JwtAuthGuard)
@ApiTags('Workouts')
@ApiBearerAuth('access-token')
export class WorkoutController {
  constructor(
    private readonly workoutService: WorkoutService,
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
      const response = await this.workoutService.create(workout, userId);
      return this.mapper.map(response, CreateWorkout, CreateWorkoutResponseDto);
    } catch (e) {
      if (e instanceof ResourceNotFoundException) {
        throw new NotFoundException(e.message);
      }
      throw new ConflictException(e.message);
    }
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

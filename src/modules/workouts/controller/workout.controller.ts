import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { WorkoutRequestDto } from '../dtos/workout-request.dto';
import { WorkoutResponseDto } from '../dtos/workout-response.dto';
import { InsertWorkoutModel } from '../models';
import { WorkoutService } from '../service/workout.service';

@Controller('api/workouts')
@UseGuards(AuthGuard)
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  @Post()
  async createWorkout(
    @Body() createWorkoutDto: WorkoutRequestDto,
    @Headers('user-id') userId: string,
  ): Promise<WorkoutResponseDto> {
    try {
      const workoutModel = plainToInstance(
        InsertWorkoutModel,
        createWorkoutDto,
      );
      const createdWorkout = await this.workoutService.create(
        workoutModel,
        userId,
      );
      return plainToInstance(WorkoutResponseDto, createdWorkout);
    } catch (e) {
      if (e instanceof ResourceNotFoundException) {
        throw new NotFoundException(e.message);
      }
      throw new ConflictException(e.message);
    }
  }

  @Get(':id')
  async getWorkoutById(
    @Headers('user-id') userId: string,
    @Param('id') workoutId: string,
  ): Promise<WorkoutResponseDto> {
    try {
      const workout = await this.workoutService.findById(workoutId, userId);
      return plainToInstance(WorkoutResponseDto, workout);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @Get()
  async getAllWorkouts(
    @Headers('user-id') userId: string,
  ): Promise<WorkoutResponseDto[]> {
    try {
      const workouts = await this.workoutService.findAll(userId);
      return workouts.map((workout) =>
        plainToInstance(WorkoutResponseDto, workout),
      );
    } catch (e) {
      throw new ConflictException(e.message);
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteWorkout(
    @Headers('user-id') userId: string,
    @Param('id') workoutId: string,
  ): Promise<void> {
    try {
      await this.workoutService.delete(workoutId, userId);
    } catch (e) {
      if (e instanceof ResourceNotFoundException) {
        throw new NotFoundException(e.message);
      }

      throw new ConflictException(e.message);
    }
  }

  @Put(':id')
  async updateWorkout(
    @Headers('user-id') userId: string,
    @Param('id') workoutId: string,
    @Body() updateWorkoutDto: WorkoutRequestDto,
  ): Promise<WorkoutResponseDto> {
    const workoutModel = plainToInstance(InsertWorkoutModel, updateWorkoutDto);
    try {
      const updatedWorkout = await this.workoutService.update(
        workoutId,
        userId,
        workoutModel,
      );
      return plainToInstance(WorkoutResponseDto, updatedWorkout);
    } catch (e) {
      if (e instanceof ResourceNotFoundException) {
        throw new NotFoundException(e.message);
      }
      throw new ConflictException(e.message);
    }
  }
}

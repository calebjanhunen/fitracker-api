import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { CreateWorkoutResponseDto } from '../dtos/create-workout-response.dto';
import { DeleteWorkoutDto } from '../dtos/delete-workout-response.dto';
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
  ): Promise<CreateWorkoutResponseDto> {
    try {
      const workoutModel = plainToInstance(
        InsertWorkoutModel,
        createWorkoutDto,
      );
      const result = await this.workoutService.create(workoutModel, userId);
      return plainToInstance(CreateWorkoutResponseDto, result);
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
      return plainToInstance(WorkoutResponseDto, workout, {
        excludeExtraneousValues: true,
      });
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
        plainToInstance(WorkoutResponseDto, workout, {
          excludeExtraneousValues: true,
        }),
      );
    } catch (e) {
      throw new ConflictException(e.message);
    }
  }

  @Delete(':id')
  async deleteWorkout(
    @Headers('user-id') userId: string,
    @Param('id') workoutId: string,
  ): Promise<DeleteWorkoutDto> {
    throw new HttpException(
      'This endpoint has been temporarily disabled',
      HttpStatus.NOT_IMPLEMENTED,
    );
    // try {
    //   const response = await this.workoutService.delete(workoutId, userId);
    //   return plainToInstance(DeleteWorkoutDto, response);
    // } catch (e) {
    //   if (e instanceof ResourceNotFoundException) {
    //     throw new NotFoundException(e.message);
    //   }

    //   throw new ConflictException(e.message);
    // }
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

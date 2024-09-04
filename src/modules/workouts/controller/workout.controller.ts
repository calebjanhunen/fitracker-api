import {
  Body,
  ConflictException,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  Post,
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

  // @Get()
  // async getWorkouts(
  //   @Headers('user-id') userId: string,
  // ): Promise<WorkoutResponseDto[]> {
  //   try {
  //     const workouts = await this.workoutsService.getWorkouts(userId);
  //     return workouts.map((workout) => WorkoutMapper.fromEntityToDto(workout));
  //   } catch (e) {
  //     if (e instanceof EntityNotFoundError) throw new NotFoundException(e);
  //     throw new ConflictException('Could not get workouts.');
  //   }
  // }

  // @Delete(':id')
  // @HttpCode(204)
  // async deleteWorkout(
  //   @Headers('user-id') userId: string,
  //   @Param('id') id: string,
  // ): Promise<void> {
  //   try {
  //     await this.workoutsService.deleteWorkout(id, userId);
  //   } catch (err) {
  //     if (err instanceof ResourceNotFoundException) {
  //       throw new NotFoundException(err.message);
  //     }

  //     throw new ConflictException(`Could not delete workout: ${id}`);
  //   }
  // }
}

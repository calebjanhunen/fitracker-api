import {
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Headers,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { ExerciseForWorkout } from 'src/modules/exercises/interfaces/exercise-for-workout.interface';
import { UserService } from 'src/modules/user/service/user.service';
import { CreateWorkoutRequestDTO } from 'src/modules/workouts/dtos/create-workout-request.dto';
import { EntityNotFoundError } from 'typeorm';
import { ExerciseForWorkoutResponseDTO } from '../dtos/exercises-for-workout-response.dto';
import { WorkoutResponseDto } from '../dtos/workout-response.dto';
import { GetSingleWorkoutParams } from '../request/get-single-workout-params.request';
import { WorkoutsService } from '../service/workouts.service';

@Controller('api/workouts')
@UseGuards(AuthGuard)
export class WorkoutsController {
  private workoutsService: WorkoutsService;
  private userService: UserService;

  constructor(workoutsService: WorkoutsService, userService: UserService) {
    this.workoutsService = workoutsService;
    this.userService = userService;
  }

  @Post()
  async create(
    @Body() CreateWorkoutRequestDTO: CreateWorkoutRequestDTO,
    @Headers('user-id') userId: string,
  ): Promise<WorkoutResponseDto> {
    let createdWorkout: WorkoutResponseDto;
    try {
      createdWorkout = await this.workoutsService.createWorkout(
        CreateWorkoutRequestDTO,
        userId,
      );
    } catch (err) {
      if (err instanceof ResourceNotFoundException) {
        throw new NotFoundException(err.message);
      }
      throw new ConflictException(err.message);
    }

    return createdWorkout;
  }

  @Get()
  async getWorkouts(@Headers('user-id') userId: string) {
    let workouts: WorkoutResponseDto[];
    try {
      workouts = await this.workoutsService.getWorkouts(userId);
    } catch (e) {
      if (e instanceof EntityNotFoundError) throw new NotFoundException(e);
      throw new ConflictException('Could not get workouts.');
    }

    return workouts;
  }

  @Get('/exercises')
  async getExercisesForWorkout(
    @Headers('user-id') userId: string,
  ): Promise<ExerciseForWorkoutResponseDTO[]> {
    let exercises: ExerciseForWorkout[];
    try {
      exercises = await this.workoutsService.getExercisesForWorkout(userId);
    } catch (e) {
      throw new ConflictException(e);
    }

    return exercises.map((exercise) =>
      ExerciseForWorkoutResponseDTO.toDTO(exercise),
    );
  }

  @Get(':id')
  async getSingleWorkout(
    @Headers('user-id') userId: string,
    @Param() { id }: GetSingleWorkoutParams,
  ): Promise<WorkoutResponseDto> {
    let workout: WorkoutResponseDto;
    try {
      workout = await this.workoutsService.getById(id, userId);
    } catch (err) {
      throw new NotFoundException(err.message);
    }

    return workout;
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteWorkout(
    @Headers('user-id') userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    try {
      await this.workoutsService.deleteById(id, userId);
    } catch (err) {
      if (err instanceof ResourceNotFoundException) {
        throw new NotFoundException(err.message);
      }

      throw new ConflictException(`Could not delete workout: ${id}`);
    }
  }
}

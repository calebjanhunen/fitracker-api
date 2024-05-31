import {
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { DatabaseException } from 'src/common/internal-exceptions/database.exception';
import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { Exercise, Workout } from 'src/model';
import { ExerciseDoesNotBelongToUser } from 'src/modules/exercises/services/exceptions/exercise-does-not-belong-to-user.exception';
import { UserService } from 'src/modules/user/service/user.service';
import { CreateWorkoutRequestDTO } from 'src/modules/workouts/dtos/create-workout-request.dto';
import { EntityNotFoundError } from 'typeorm';
import { WorkoutResponseDTO } from '../dtos/create-workout-response.dto';
import { ExercisesForWorkoutResponseDTO } from '../dtos/exercises-for-workout-response.dto';
import { fromWorkoutEntityToDTO } from '../helpers/from-entity-to-dto.helper';
import { GetSingleWorkoutParams } from '../request/get-single-workout-params.request';
import { WorkoutsService } from '../service/workouts.service';
import { CouldNotCreateWorkoutException } from './exceptions/could-not-create-workout.exception';

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
  ): Promise<WorkoutResponseDTO> {
    let createdWorkout: Workout;
    try {
      createdWorkout = await this.workoutsService.createWorkout(
        CreateWorkoutRequestDTO,
        userId,
      );
    } catch (err) {
      console.log(err);
      if (err instanceof ResourceNotFoundException) {
        throw new NotFoundException(err.message);
      } else if (err instanceof ExerciseDoesNotBelongToUser) {
        throw new ForbiddenException(err.message);
      } else if (err instanceof DatabaseException) {
        throw new ConflictException(err.message);
      }
      throw new CouldNotCreateWorkoutException();
    }

    const workoutResponse = fromWorkoutEntityToDTO(createdWorkout);

    return workoutResponse;
  }

  @Get()
  async getWorkouts(@Headers('user-id') userId: string) {
    let workouts: Workout[];
    const response: WorkoutResponseDTO[] = [];
    try {
      workouts = await this.workoutsService.getWorkouts(userId);
    } catch (e) {
      if (e instanceof EntityNotFoundError) throw new NotFoundException(e);
      throw new ConflictException('Could not get workouts.');
    }

    workouts.forEach((workout) => {
      const workoutResponse = fromWorkoutEntityToDTO(workout);
      response.push(workoutResponse);
    });

    return response;
  }

  @Get('/exercises')
  async getExercisesForWorkout(
    @Headers('user-id') userId: string,
  ): Promise<ExercisesForWorkoutResponseDTO[]> {
    let exercises: Exercise[];
    try {
      exercises = await this.workoutsService.getExercisesForWorkout(userId);
    } catch (e) {
      throw new ConflictException(e);
    }

    return exercises;
  }

  @Get(':id')
  async getSingleWorkout(
    @Headers('user-id') userId: string,
    @Param() { id }: GetSingleWorkoutParams,
  ): Promise<WorkoutResponseDTO> {
    let workout: Workout;
    try {
      workout = await this.workoutsService.getById(id, userId);
    } catch (err) {
      throw new NotFoundException(err);
    }

    const workoutResponse = fromWorkoutEntityToDTO(workout);
    return workoutResponse;
  }

  // @Delete(':id')
  // @HttpCode(204)
  // async deleteWorkout(
  //   @Headers('user-id') userId: string,
  //   @Param('id') id: string,
  // ): Promise<void> {
  //   try {
  //     await this.workoutsService.deleteById(id, userId);
  //   } catch (err) {
  //     if (err instanceof ResourceNotFoundException) {
  //       throw new NotFoundException(err.message);
  //     }

  //     throw new HttpException('Could not delete workout', HttpStatus.CONFLICT);
  //   }
  // }
}

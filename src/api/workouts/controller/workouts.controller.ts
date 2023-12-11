import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from 'src/api/user/service/user.service';
import { UserNotFoundException } from 'src/api/utils/exceptions/user-not-found.exception';
import { ResourceNotFoundException } from 'src/common/business-exceptions/resource-not-found.exception';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { User, Workout } from 'src/model';
import { CreateWorkoutAdapter } from '../adapter/create-workout.adapter';
import { WorkoutResponseAdapter } from '../adapter/workout-response.adapter';
import { CreateWorkoutRequest } from '../request/create-workout.request';
import { GetSingleWorkoutParams } from '../request/get-single-workout-params.request';
import { WorkoutResponse } from '../response/workout.response';
import { WorkoutsService } from '../service/workouts.service';
import { CouldNotCreateWorkoutException } from './exceptions/could-not-create-workout.exception';
import { CouldNotFindWorkoutException } from './exceptions/could-not-find-workout.exception';

@Controller('api/workouts')
@UseGuards(AuthGuard)
export class WorkoutsController {
  private workoutsService: WorkoutsService;
  private createWorkoutAdapter: CreateWorkoutAdapter;
  private userService: UserService;
  private workoutResponseAdapter: WorkoutResponseAdapter;

  constructor(
    workoutsService: WorkoutsService,
    userService: UserService,
    createWorkoutAdapter: CreateWorkoutAdapter,
    workoutResponseAdapter: WorkoutResponseAdapter,
  ) {
    this.workoutsService = workoutsService;
    this.createWorkoutAdapter = createWorkoutAdapter;
    this.userService = userService;
    this.workoutResponseAdapter = workoutResponseAdapter;
  }

  @Post()
  async create(
    @Body() createWorkoutDto: CreateWorkoutRequest,
    @Headers('user-id') userId: string,
  ): Promise<WorkoutResponse> {
    let createdWorkout: Workout;
    const workoutModel = this.createWorkoutAdapter.fromDtoToEntity(
      createWorkoutDto,
      userId,
    );

    try {
      const createdWorkoutId =
        await this.workoutsService.createWorkout(workoutModel);
      createdWorkout = await this.workoutsService.getById(
        createdWorkoutId,
        userId,
      );
    } catch (err) {
      throw new CouldNotCreateWorkoutException();
    }

    const workoutResponse =
      this.workoutResponseAdapter.fromEntityToResponse(createdWorkout);

    return workoutResponse;
  }

  @Get()
  async getWorkouts(@Headers('user-id') userId: string) {
    let user: User;
    const workoutsResponse: WorkoutResponse[] = [];

    try {
      user = await this.userService.getById(userId);
    } catch (error) {
      throw new NotFoundException();
    }

    const workouts = await this.workoutsService.getWorkouts(user);

    workouts.forEach((workout) => {
      const workoutResponse =
        this.workoutResponseAdapter.fromEntityToResponse(workout);
      workoutsResponse.push(workoutResponse);
    });

    return workoutsResponse;
  }

  @Get(':id')
  async getSingleWorkout(
    @Headers('user-id') userId: string,
    @Param() { id }: GetSingleWorkoutParams,
  ): Promise<WorkoutResponse> {
    let workout: Workout;

    try {
      await this.userService.getById(userId);
    } catch (err) {
      throw new UserNotFoundException();
    }

    try {
      workout = await this.workoutsService.getById(id, userId);
    } catch (err) {
      throw new CouldNotFindWorkoutException();
    }

    const workoutResponse =
      this.workoutResponseAdapter.fromEntityToResponse(workout);
    return workoutResponse;
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

      throw new HttpException('Could not delete workout', HttpStatus.CONFLICT);
    }
  }
}

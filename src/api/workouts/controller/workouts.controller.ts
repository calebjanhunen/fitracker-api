import {
  Body,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from 'src/api/user/service/user.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { User } from 'src/model';
import { CreateWorkoutAdapter } from '../adapter/create-workout.adapter';
import { WorkoutResponseAdapter } from '../adapter/workout-response.adapter';
import { CreateWorkoutRequest } from '../request/create-workout.request';
import { CreateWorkoutResponse } from '../response/create-workout.response';
import { WorkoutResponse } from '../response/workout.response';
import { WorkoutsService } from '../service/workouts.service';

@Controller('workouts')
@UseGuards(AuthGuard)
export class WorkoutsController {
  private workoutsService: WorkoutsService;
  private createWorkoutAdapter: CreateWorkoutAdapter;
  private userService: UserService;
  private workoutResponseAdapter: WorkoutResponseAdapter;

  constructor(
    workoutsService: WorkoutsService,
    createWorkoutAdapter: CreateWorkoutAdapter,
    userService: UserService,
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
  ): Promise<CreateWorkoutResponse> {
    const workoutModel = this.createWorkoutAdapter.fromDtoToEntity(
      createWorkoutDto,
      userId,
    );

    const createdWorkoutId =
      await this.workoutsService.createWorkout(workoutModel);

    return { id: createdWorkoutId };
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
}

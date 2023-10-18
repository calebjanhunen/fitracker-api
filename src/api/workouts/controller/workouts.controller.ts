import {
  Body,
  Controller,
  Headers,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CreateWorkoutAdapter } from '../adapter/create-workout.adapter';
import { CreateWorkoutRequest } from '../request/create-workout.request';
import { CreateWorkoutResponse } from '../response/create-workout.response';
import { WorkoutsService } from '../service/workouts.service';

@Controller('workouts')
@UseGuards(AuthGuard)
export class WorkoutsController {
  private workoutsService: WorkoutsService;
  private createWorkoutAdapter: CreateWorkoutAdapter;

  constructor(
    workoutsService: WorkoutsService,
    createWorkoutAdapter: CreateWorkoutAdapter,
  ) {
    this.workoutsService = workoutsService;
    this.createWorkoutAdapter = createWorkoutAdapter;
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
}

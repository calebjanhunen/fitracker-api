import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CreateWorkoutAdapter } from '../adapter/create-workout.adapter';
import { CreateWorkoutDto } from '../dto/create-workout.dto';
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
    @Body() createWorkoutDto: CreateWorkoutDto,
    @Headers('user-id') userId: string,
  ) {
    const workoutModel = this.createWorkoutAdapter.fromDtoToEntity(
      createWorkoutDto,
      userId,
    );

    // return workoutModel;

    return await this.workoutsService.createWorkout(workoutModel);
  }
}

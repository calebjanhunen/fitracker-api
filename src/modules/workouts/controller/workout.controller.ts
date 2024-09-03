import {
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { UserService } from 'src/modules/user/service/user.service';
import { WorkoutResponseDto } from '../dtos/workout-response.dto';
import { WorkoutService } from '../service/workout.service';

@Controller('api/workouts')
@UseGuards(AuthGuard)
export class WorkoutController {
  private workoutService: WorkoutService;
  private userService: UserService;

  constructor(workoutService: WorkoutService, userService: UserService) {
    this.workoutService = workoutService;
    this.userService = userService;
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

  // @Post()
  // async create(
  //   @Body() createWorkoutDto: CreateWorkoutRequestDTO,
  //   @Headers('user-id') userId: string,
  // ): Promise<WorkoutResponseDto> {
  //   try {
  //     const createdWorkout = await this.workoutsService.createWorkout(
  //       createWorkoutDto,
  //       userId,
  //     );
  //     return WorkoutMapper.fromEntityToDto(createdWorkout);
  //   } catch (err) {
  //     if (err instanceof ResourceNotFoundException) {
  //       throw new NotFoundException(err.message);
  //     }
  //     throw new ConflictException(err.message);
  //   }
  // }

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

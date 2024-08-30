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
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { UserService } from 'src/modules/user/service/user.service';
import { CreateWorkoutRequestDTO } from 'src/modules/workouts/dtos/create-workout-request.dto';
import { EntityNotFoundError } from 'typeorm';
import { WorkoutResponseDto } from '../dtos/workout-response.dto';
import { WorkoutMapper } from '../mappers/workout-mapper';
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

  // @Get(':id')
  // async getSingleWorkout(
  //   @Headers('user-id') userId: string,
  //   @Param() { id }: GetSingleWorkoutParams,
  // ): Promise<WorkoutResponseDto> {
  //   try {
  //     const workout = await this.workoutsService.getById(id, userId);
  //     return WorkoutMapper.fromEntityToDto(workout);
  //   } catch (err) {
  //     throw new NotFoundException(err.message);
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

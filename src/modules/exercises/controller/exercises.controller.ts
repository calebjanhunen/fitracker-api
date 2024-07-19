import {
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Headers,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { PaginationParams } from 'src/common/requests/pagination-params.request';
import { ListResponse } from 'src/common/responses/list.response';
import { CollectionModel } from 'src/model';
import { ExerciseForWorkoutResponseDTO } from 'src/modules/exercises/dtos/exercises-for-workout-response.dto';
import { ExerciseIsNotCustomError } from 'src/modules/exercises/internal-errors/exercise-is-not-custom.error';
import { Exercise } from 'src/modules/exercises/models/exercise.entity';
import { ExerciseRequestDto } from '../dtos/exercise-request.dto';
import { ExerciseResponseDto } from '../dtos/exercise-response.dto';
import { ExerciseMapper } from '../mappers/exercise.mapper';
import { ExercisesForWorkoutMapper } from '../mappers/exercises-for-workout.mapper';
import ExercisesService from '../services/exercises.service';

@Controller('api/exercises')
@UseGuards(AuthGuard)
export default class ExercisesController {
  constructor(private exercisesService: ExercisesService) {}

  @Post()
  async createExercise(
    @Headers('user-id') userId: string,
    @Body() createExerciseDto: ExerciseRequestDto,
  ): Promise<ExerciseResponseDto> {
    const exerciseEntity = ExerciseMapper.fromDtoToEntity(createExerciseDto);

    try {
      const createdExercise = await this.exercisesService.createExercise(
        exerciseEntity,
        userId,
      );

      return ExerciseMapper.fromEntityToDto(createdExercise);
    } catch (e) {
      throw new ConflictException(e.message);
    }
  }

  @Get()
  async getExercises(
    @Headers('user-id') userId: string,
    @Query() { page, limit }: PaginationParams,
  ): Promise<ListResponse<Exercise>> {
    const response = new ListResponse<Exercise>();

    let exercisesCollectionModel: CollectionModel<Exercise>;
    try {
      exercisesCollectionModel =
        await this.exercisesService.getExercisesForUser(userId, page, limit);
    } catch (error) {
      throw new ConflictException();
    }

    response.resources = exercisesCollectionModel.listObjects;
    response.totalRecords = exercisesCollectionModel.totalCount;
    response.hasMore = exercisesCollectionModel.hasMore();

    return response;
  }

  @Get(':id')
  async getSingleExercise(
    @Headers('user-id') userId: string,
    @Param('id') id: string,
  ): Promise<ExerciseResponseDto> {
    try {
      const exercise = await this.exercisesService.getSingleExerciseById(
        id,
        userId,
      );
      return ExerciseMapper.fromEntityToDto(exercise);
    } catch (e) {
      if (e instanceof ResourceNotFoundException)
        throw new NotFoundException(e.message);

      throw new ConflictException('Error getting exercise');
    }
  }

  @Get('exercises-for-workout')
  async getExercisesForWorkout(
    @Headers('user-id') userId: string,
  ): Promise<ExerciseForWorkoutResponseDTO[]> {
    try {
      const exercisesForWorkout =
        await this.exercisesService.getExercisesForWorkout(userId);
      return exercisesForWorkout.map((exercise) =>
        ExercisesForWorkoutMapper.fromEntityToDto(exercise),
      );
    } catch (e) {
      throw new ConflictException(e.message);
    }
  }

  @Put(':id')
  async updateExercise(
    @Headers('user-id') userId: string,
    @Param('id') id: string,
    @Body() updateExerciseDto: ExerciseRequestDto,
  ): Promise<ExerciseResponseDto> {
    const exerciseEntity = ExerciseMapper.fromDtoToEntity(updateExerciseDto);

    try {
      const updatedExercise = await this.exercisesService.updateExercise(
        id,
        exerciseEntity,
        userId,
      );
      return ExerciseMapper.fromEntityToDto(updatedExercise);
    } catch (e) {
      if (e instanceof ResourceNotFoundException)
        throw new NotFoundException(e.message);
      if (e instanceof ExerciseIsNotCustomError)
        throw new ForbiddenException(e.message);

      throw new ConflictException(e.message);
    }
  }

  @Delete(':id')
  async deleteExercise(
    @Headers('user-id') userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    try {
      await this.exercisesService.deleteExercise(id, userId);
    } catch (e) {
      if (e instanceof ResourceNotFoundException)
        throw new NotFoundException(e.message);
      if (e instanceof ExerciseIsNotCustomError)
        throw new ForbiddenException(e.message);

      throw new ConflictException(e.message);
    }
  }
}

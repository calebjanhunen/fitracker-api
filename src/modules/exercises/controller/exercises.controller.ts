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
import { UserNotFoundException } from 'src/common/http-exceptions/user-not-found.exception';
import { PaginationParams } from 'src/common/requests/pagination-params.request';
import { ListResponse } from 'src/common/responses/list.response';
import { CollectionModel, Exercise, User } from 'src/model';
import { ExerciseIsNotCustomError } from 'src/modules/exercises/internal-errors/exercise-is-not-custom.error';
import { EntityNotFoundError } from 'typeorm';
import { UserService } from '../../user/service/user.service';
import { ExerciseRequest } from '../request/exercise.request';
import { ExerciseResponse } from '../response/exercise.response';
import { ExerciseDoesNotBelongToUser } from '../services/exceptions/exercise-does-not-belong-to-user.exception';
import ExercisesService from '../services/exercises.service';
import { CouldNotDeleteExerciseException } from './exceptions/could-not-delete-exercise.exception';
import { ExerciseNotFoundException } from './exceptions/exercise-not-found.exception';

@Controller('api/exercises')
@UseGuards(AuthGuard)
export default class ExercisesController {
  private exercisesService: ExercisesService;
  private userService: UserService;

  constructor(exercisesService: ExercisesService, userService: UserService) {
    this.exercisesService = exercisesService;
    this.userService = userService;
  }

  @Get()
  async getExercises(
    @Headers('user-id') userId: string,
    @Query() { page, limit }: PaginationParams,
  ): Promise<ListResponse<Exercise>> {
    const response = new ListResponse<Exercise>();
    let user: User;

    try {
      user = await this.userService.getById(userId);
    } catch (error) {
      throw new NotFoundException();
    }

    let exercisesCollectionModel: CollectionModel<Exercise>;
    try {
      exercisesCollectionModel =
        await this.exercisesService.getDefaultAndUserCreatedExercises(
          user,
          page,
          limit,
        );
    } catch (error) {
      throw new ConflictException();
    }

    response.resources = exercisesCollectionModel.listObjects;
    response.totalRecords = exercisesCollectionModel.totalCount;
    response.hasMore = exercisesCollectionModel.hasMore();

    return response;
  }

  @Get(':id')
  async getExercise(
    @Headers('user-id') userId: string,
    @Param('id') id: string,
  ): Promise<ExerciseResponse> {
    let exerciseResponse = new ExerciseResponse();

    let user: User;
    try {
      user = await this.userService.getById(userId);
    } catch (error) {
      throw new UserNotFoundException();
    }

    let exercise: Exercise;
    try {
      exercise = await this.exercisesService.getById(id, user.id);
    } catch (error) {
      if (error instanceof ExerciseDoesNotBelongToUser)
        throw new ForbiddenException();

      throw new ExerciseNotFoundException();
    }

    exerciseResponse = exerciseResponse.fromEntityToResponse(exercise);

    return exerciseResponse;
  }

  @Post()
  async createExercise(
    @Headers('user-id') userId: string,
    @Body() createExerciseRequest: ExerciseRequest,
  ): Promise<ExerciseResponse> {
    let user: User;
    let exerciseResponse = new ExerciseResponse();

    try {
      user = await this.userService.getById(userId);
    } catch (error) {
      throw new UserNotFoundException();
    }

    const exerciseEntity = createExerciseRequest.fromCreateRequestToEntity(
      createExerciseRequest,
      user,
    );

    const createdExercise =
      await this.exercisesService.createCustomExercise(exerciseEntity);

    exerciseResponse = exerciseResponse.fromEntityToResponse(createdExercise);

    return exerciseResponse;
  }

  @Put(':id')
  async updateExercise(
    @Headers('user-id') userId: string,
    @Param('id') id: string,
    @Body() createExerciseRequest: ExerciseRequest,
  ): Promise<ExerciseResponse> {
    let user: User;
    let exerciseResponse = new ExerciseResponse();

    try {
      user = await this.userService.getById(userId);
    } catch (error) {
      throw new UserNotFoundException();
    }

    const exerciseEntity = createExerciseRequest.fromUpdateRequestToEntity(
      createExerciseRequest,
    );

    let updatedExercise: Exercise;
    try {
      updatedExercise = await this.exercisesService.update(
        id,
        exerciseEntity,
        user,
      );
    } catch (error) {
      if (error instanceof ExerciseDoesNotBelongToUser)
        throw new ForbiddenException(error.message);
      if (error instanceof EntityNotFoundError)
        throw new ExerciseNotFoundException();
      if (error instanceof ExerciseIsNotCustomError)
        throw new ForbiddenException(error.message);

      throw new ConflictException(
        'Could not update exercise using the given id',
      );
    }

    exerciseResponse = exerciseResponse.fromEntityToResponse(updatedExercise);

    return exerciseResponse;
  }

  @Delete(':id')
  async deleteExercise(
    @Headers('user-id') userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    let user: User;
    try {
      user = await this.userService.getById(userId);
    } catch (error) {
      throw new UserNotFoundException();
    }

    try {
      await this.exercisesService.deleteById(id, user);
    } catch (error) {
      if (error instanceof ExerciseDoesNotBelongToUser)
        throw new ForbiddenException();
      if (error instanceof EntityNotFoundError)
        throw new ExerciseNotFoundException();
      if (error instanceof ExerciseIsNotCustomError)
        throw new ForbiddenException(error.message);

      throw new CouldNotDeleteExerciseException();
    }
  }
}

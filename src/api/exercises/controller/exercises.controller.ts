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
  Query,
  UseGuards,
} from '@nestjs/common';
import { ExerciseUserDoesNotMatchUserInRequestError } from 'src/api/utils/internal-errors/ExerciseUserDoesNotMatchUserInRequestError';
import { UserNotFoundException } from 'src/common/exceptions/user-not-found.exception';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { PaginationParams } from 'src/common/requests/pagination-params.request';
import { ListResponse } from 'src/common/responses/list.response';
import { IUser } from 'src/interfaces';
import { CollectionModel, Exercise, User } from 'src/model';
import { UserService } from '../../user/service/user.service';
import { CreateExerciseRequest } from '../request/create-exercise.request';
import { ExerciseResponse } from '../response/exercise.response';
import ExercisesService from '../services/exercises.service';
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
    let user: IUser;

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
      exercise = await this.exercisesService.getById(id, user);
    } catch (error) {
      if (error instanceof ExerciseUserDoesNotMatchUserInRequestError)
        throw new ForbiddenException();

      throw new ExerciseNotFoundException();
    }

    exerciseResponse = exerciseResponse.fromEntityToResponse(exercise);

    return exerciseResponse;
  }

  @Post()
  async createExercise(
    @Headers('user-id') userId: string,
    @Body() createExerciseRequest: CreateExerciseRequest,
  ): Promise<ExerciseResponse> {
    let user: User;
    let exerciseResponse = new ExerciseResponse();

    try {
      user = await this.userService.getById(userId);
    } catch (error) {
      throw new UserNotFoundException();
    }

    const exerciseEntity = createExerciseRequest.fromRequestToEntity(
      createExerciseRequest,
      user,
    );

    const createdExercise =
      await this.exercisesService.createCustomExercise(exerciseEntity);

    exerciseResponse = exerciseResponse.fromEntityToResponse(createdExercise);

    return exerciseResponse;
  }
}

import {
  ConflictException,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { PaginationParams } from 'src/common/requests/pagination-params.request';
import { ListResponse } from 'src/common/responses/list.response';
import { IUser } from 'src/interfaces';
import { CollectionModel, Exercise } from 'src/model';
import { UserService } from '../../user/service/user.service';
import ExercisesService from '../services/exercises.service';

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
}

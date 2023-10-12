import {
  ConflictException,
  Controller,
  Get,
  Headers,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { IExercise, IUser } from 'src/interfaces';
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
  async getAllExercises(
    @Headers('user-id') userId: string,
  ): Promise<IExercise[]> {
    let user: IUser;
    let allExercises: IExercise[];

    try {
      user = await this.userService.getById(userId);
    } catch (error) {
      throw new NotFoundException();
    }

    try {
      allExercises =
        await this.exercisesService.getDefaultAndUserCreatedExercises(user);
    } catch (error) {
      throw new ConflictException();
    }

    return allExercises;
  }
}

import {
  Body,
  ConflictException,
  Controller,
  Headers,
  Post,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ExerciseRequestDto } from '../dtos/exercise-request.dto';
import { ExerciseResponseDto } from '../dtos/exercise-response.dto';
import { InsertExerciseModel } from '../models/insert-exercise.model';
import { ExerciseService } from '../services/exercise.service';

@Controller('api/exercises')
@UseGuards(AuthGuard)
export default class ExercisesController {
  constructor(private exerciseService: ExerciseService) {}

  @Post()
  async createExercise(
    @Headers('user-id') userId: string,
    @Body() createExerciseDto: ExerciseRequestDto,
  ): Promise<ExerciseResponseDto> {
    const insertExerciseModel = plainToInstance(
      InsertExerciseModel,
      createExerciseDto,
    );
    try {
      const createdExercise = await this.exerciseService.create(
        insertExerciseModel,
        userId,
      );

      return plainToInstance(ExerciseResponseDto, createdExercise);
    } catch (e) {
      throw new ConflictException(e.message);
    }
  }

  // @Get()
  // async getExercises(
  //   @Headers('user-id') userId: string,
  //   @Query() { page, limit }: PaginationParams,
  // ): Promise<ListResponse<Exercise>> {
  //   const response = new ListResponse<Exercise>();

  //   let exercisesCollectionModel: CollectionModel<Exercise>;
  //   try {
  //     exercisesCollectionModel =
  //       await this.exercisesService.getExercisesForUser(userId, page, limit);
  //   } catch (error) {
  //     throw new ConflictException();
  //   }

  //   response.resources = exercisesCollectionModel.listObjects;
  //   response.totalRecords = exercisesCollectionModel.totalCount;
  //   response.hasMore = exercisesCollectionModel.hasMore();

  //   return response;
  // }

  // @Get('exercises-for-workout')
  // async getExercisesForWorkout(
  //   @Headers('user-id') userId: string,
  // ): Promise<ExerciseForWorkoutResponseDTO[]> {
  //   try {
  //     const exercisesForWorkout =
  //       await this.exercisesService.getExercisesForWorkout(userId);
  //     return exercisesForWorkout.map((exercise) =>
  //       ExercisesForWorkoutMapper.fromEntityToDto(exercise),
  //     );
  //   } catch (e) {
  //     throw new ConflictException(e.message);
  //   }
  // }

  // @Get(':id')
  // async getSingleExercise(
  //   @Headers('user-id') userId: string,
  //   @Param('id') id: string,
  // ): Promise<ExerciseResponseDto> {
  //   try {
  //     const exercise = await this.exercisesService.getSingleExerciseById(
  //       id,
  //       userId,
  //     );
  //     return ExerciseMapper.fromEntityToDto(exercise);
  //   } catch (e) {
  //     if (e instanceof ResourceNotFoundException)
  //       throw new NotFoundException(e.message);

  //     throw new ConflictException('Error getting exercise');
  //   }
  // }

  // @Put(':id')
  // async updateExercise(
  //   @Headers('user-id') userId: string,
  //   @Param('id') id: string,
  //   @Body() updateExerciseDto: ExerciseRequestDto,
  // ): Promise<ExerciseResponseDto> {
  //   const exerciseEntity = ExerciseMapper.fromDtoToEntity(updateExerciseDto);

  //   try {
  //     const updatedExercise = await this.exercisesService.updateExercise(
  //       id,
  //       exerciseEntity,
  //       userId,
  //     );
  //     return ExerciseMapper.fromEntityToDto(updatedExercise);
  //   } catch (e) {
  //     if (e instanceof ResourceNotFoundException)
  //       throw new NotFoundException(e.message);
  //     if (e instanceof ExerciseIsNotCustomError)
  //       throw new ForbiddenException(e.message);

  //     throw new ConflictException(e.message);
  //   }
  // }

  // @Delete(':id')
  // async deleteExercise(
  //   @Headers('user-id') userId: string,
  //   @Param('id') id: string,
  // ): Promise<void> {
  //   try {
  //     await this.exercisesService.deleteExercise(id, userId);
  //   } catch (e) {
  //     if (e instanceof ResourceNotFoundException)
  //       throw new NotFoundException(e.message);
  //     if (e instanceof ExerciseIsNotCustomError)
  //       throw new ForbiddenException(e.message);

  //     throw new ConflictException(e.message);
  //   }
  // }
}

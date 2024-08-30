import {
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { ExerciseRequestDto } from '../dtos/exercise-request.dto';
import { ExerciseResponseDto } from '../dtos/exercise-response.dto';
import { ExerciseIsNotCustomException } from '../internal-errors/exercise-is-not-custom.exception';
import { ExerciseNotFoundException } from '../internal-errors/exercise-not-found.exception';
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

  @Get()
  async getAllExercises(
    @Headers('user-id') userId: string,
  ): Promise<ExerciseResponseDto[]> {
    try {
      const exercises = await this.exerciseService.findAll(userId);
      return plainToInstance(ExerciseResponseDto, exercises);
    } catch (e) {
      throw new ConflictException(e.message);
    }
  }

  @Get(':id')
  async getExerciseById(
    @Headers('user-id') userId: string,
    @Param('id') exerciseId: string,
  ): Promise<ExerciseResponseDto> {
    try {
      const exercise = await this.exerciseService.findById(exerciseId, userId);
      return plainToInstance(ExerciseResponseDto, exercise);
    } catch (e) {
      if (e instanceof ResourceNotFoundException)
        throw new NotFoundException(e.message);

      throw new ConflictException('Error getting exercise');
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteExercise(
    @Headers('user-id') userId: string,
    @Param('id') exerciseId: string,
  ): Promise<void> {
    try {
      await this.exerciseService.delete(exerciseId, userId);
    } catch (e) {
      if (e instanceof ExerciseNotFoundException)
        throw new NotFoundException(e.message);
      if (e instanceof ExerciseIsNotCustomException)
        throw new ForbiddenException(e.message);

      throw new ConflictException(e.message);
    }
  }

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
}

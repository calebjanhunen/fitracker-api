import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from 'src/common/decorators';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { ExerciseDetailsDto } from '../dtos/exercise-details.dto';
import { ExerciseRequestDto } from '../dtos/exercise-request.dto';
import { ExerciseResponseDto } from '../dtos/exercise-response.dto';
import { ExerciseWithWorkoutDetailsDto } from '../dtos/exericse-with-workout-details.dto';
import { ExerciseIsNotCustomException } from '../internal-errors/exercise-is-not-custom.exception';
import { ExerciseNotFoundException } from '../internal-errors/exercise-not-found.exception';
import { ExerciseDetailsModel } from '../models/exercise-details.model';
import { InsertExerciseModel } from '../models/insert-exercise.model';
import { ExerciseService } from '../services/exercise.service';

@Controller('api/exercises')
@UseGuards(JwtAuthGuard)
export default class ExercisesController {
  constructor(
    private exerciseService: ExerciseService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Post()
  public async createExercise(
    @CurrentUser() userId: string,
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
  public async getAllExercises(
    @CurrentUser() userId: string,
  ): Promise<ExerciseResponseDto[]> {
    try {
      const exercises = await this.exerciseService.findAll(userId);
      return plainToInstance(ExerciseResponseDto, exercises);
    } catch (e) {
      throw new ConflictException(e.message);
    }
  }

  @Get('/workout-details')
  public async getExercisesWithWorkoutDetails(
    @CurrentUser() userId: string,
  ): Promise<ExerciseWithWorkoutDetailsDto[]> {
    try {
      const exercisesWithWorkout =
        await this.exerciseService.getExerciseWithWorkoutDetails(userId);
      return plainToInstance(
        ExerciseWithWorkoutDetailsDto,
        exercisesWithWorkout,
      );
    } catch (e) {
      throw new ConflictException(e.message);
    }
  }

  @Get(':exerciseId/details')
  public async getExerciseDetails(
    @CurrentUser() userId: string,
    @Param('exerciseId') exerciseId: string,
  ): Promise<ExerciseDetailsDto> {
    try {
      const exercise = await this.exerciseService.getExerciseDetails(
        exerciseId,
        userId,
      );
      return this.mapper.map(
        exercise,
        ExerciseDetailsModel,
        ExerciseDetailsDto,
      );
    } catch (e) {
      if (e instanceof ResourceNotFoundException) {
        throw new NotFoundException(e.message);
      }
      throw new ConflictException(e);
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteExercise(
    @CurrentUser() userId: string,
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

  @Put(':id')
  public async updateExercise(
    @CurrentUser() userId: string,
    @Param('id') exerciseId: string,
    @Body() updateExerciseDto: ExerciseRequestDto,
  ): Promise<ExerciseResponseDto> {
    const updateExerciseModel = plainToInstance(
      InsertExerciseModel,
      updateExerciseDto,
    );
    try {
      const updatedExercise = await this.exerciseService.update(
        exerciseId,
        updateExerciseModel,
        userId,
      );
      return plainToInstance(ExerciseResponseDto, updatedExercise);
    } catch (e) {
      if (e instanceof ResourceNotFoundException)
        throw new NotFoundException(e.message);
      if (e instanceof ExerciseIsNotCustomException)
        throw new ForbiddenException(e.message);

      throw new ConflictException(e.message);
    }
  }
}

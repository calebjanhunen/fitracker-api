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
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from 'src/common/decorators';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ResourceNotFoundException } from 'src/common/internal-exceptions';
import {
  ExerciseDetailsDto,
  ExerciseRequestDto,
  ExerciseResponseDto,
  ExerciseWithWorkoutDetailsDto,
  LookupItemDto,
} from '../dtos';
import {
  ExerciseIsNotCustomException,
  ExerciseNotFoundException,
} from '../internal-errors';
import {
  ExerciseDetailsModel,
  InsertExerciseModel,
  LookupItem,
} from '../models';
import { CableAttachmentService, ExerciseService } from '../services';

@Controller('api/exercises')
@UseGuards(JwtAuthGuard)
@ApiTags('Exercises')
@ApiBearerAuth('access-token')
export default class ExercisesController {
  constructor(
    private exerciseService: ExerciseService,
    @InjectMapper() private mapper: Mapper,
    private readonly cableAttachmentService: CableAttachmentService,
  ) {}

  @Post()
  @ApiResponse({ status: HttpStatus.CREATED, type: ExerciseResponseDto })
  @ApiResponse({ status: HttpStatus.CONFLICT })
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
  @ApiResponse({
    status: HttpStatus.OK,
    type: ExerciseResponseDto,
    isArray: true,
  })
  @ApiResponse({ status: HttpStatus.CONFLICT })
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
  @ApiResponse({
    status: HttpStatus.OK,
    type: ExerciseWithWorkoutDetailsDto,
    isArray: true,
  })
  @ApiResponse({ status: HttpStatus.CONFLICT })
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
  @ApiResponse({ status: HttpStatus.OK, type: ExerciseDetailsDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  @ApiResponse({ status: HttpStatus.CONFLICT })
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
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @ApiResponse({ status: HttpStatus.CONFLICT })
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
  @ApiResponse({ status: HttpStatus.OK, type: ExerciseResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  @ApiResponse({ status: HttpStatus.CONFLICT })
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

  @Get('cableAttachments')
  @ApiResponse({ status: HttpStatus.OK, type: LookupItemDto, isArray: true })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR })
  public async getAllCableAttachments(): Promise<LookupItemDto[]> {
    const attachments = await this.cableAttachmentService.getAllAttachments();
    return this.mapper.mapArray(attachments, LookupItem, LookupItemDto);
  }
}

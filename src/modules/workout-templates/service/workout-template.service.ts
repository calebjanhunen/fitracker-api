import { Injectable } from '@nestjs/common';
import ExercisesService from 'src/modules/exercises/services/exercises.service';
import { UserService } from 'src/modules/user/service/user.service';
import {
  WorkoutTemplateRequestDto,
  WorkoutTemplateRequestExerciseDto,
} from '../dto/workout-template-request.dto';
import { WorkoutTemplateResponseDto } from '../dto/workout-template-response.dto';
import { WorkoutTemplateWithRecentSetsResponseDto } from '../dto/workout-template-with-recent-sets-response.dto';
import { WorkoutTemplateWithRecentSetsMapper } from '../mappers/workout-template-with-recent-sets.mapper';
import { WorkoutTemplateMapper } from '../mappers/workout-template.mapper';
import { WorkoutTemplateRepository } from '../repository/workout-template.repository';
import { CouldNotDeleteWorkoutTemplateException } from './exceptions/could-not-delete-workout-template.exception';
import { CouldNotUpdateWorkoutTemplateException } from './exceptions/could-not-update-workout-template.exception';
import { InvalidOrderException } from './exceptions/invalid-order.exception';
import { WorkoutTemplateNotFoundException } from './exceptions/workout-template-not-found.exception';

@Injectable()
export class WorkoutTemplateService {
  constructor(
    private workoutTemplateRepo: WorkoutTemplateRepository,
    private exerciseService: ExercisesService,
    private userService: UserService,
  ) {}

  /**
   * Creates a workout template for a given user
   * @param {WorkoutTemplateRequestDto} workoutTemplateDto
   * @param {string} userId
   * @returns {WorkoutTemplateResponseDto}
   */
  public async createWorkoutTemplate(
    workoutTemplateDto: WorkoutTemplateRequestDto,
    userId: string,
  ): Promise<WorkoutTemplateResponseDto> {
    const user = await this.userService.getById(userId);

    const exerciseIds = workoutTemplateDto.exercises.map((e) => e.exerciseId);
    await this.exerciseService.validateExercisesExist(exerciseIds, user);

    const workoutTemplateEntity = WorkoutTemplateMapper.fromDtoToEntity(
      workoutTemplateDto,
      user,
    );

    const createdWorkoutTemplate = await this.workoutTemplateRepo.save(
      workoutTemplateEntity,
    );

    return WorkoutTemplateMapper.fromEntityToDto(createdWorkoutTemplate);
  }

  /**
   * Gets a workout template using the id and user id
   *
   * @param {string} id
   * @param {string} userId
   * @returns {WorkoutTemplateResponseDto}
   *
   * @throws {ResourceNotFoundException}
   * @throws {WorkoutTemplateNotFoundException}
   */
  public async getSingleWorkoutTemplate(
    id: string,
    userId: string,
  ): Promise<WorkoutTemplateResponseDto> {
    await this.userService.getById(userId);

    const workoutTemplate = await this.workoutTemplateRepo.findById(id, userId);

    if (!workoutTemplate) throw new WorkoutTemplateNotFoundException(id);

    return WorkoutTemplateMapper.fromEntityToDto(workoutTemplate);
  }

  /**
   * Gets all workout templates for a given user
   * @param {string} userId
   * @returns {WorkoutTemplateResponseDto[]}
   *
   * @throws {ResourceNotFoundException}
   */
  public async getAllWorkoutTemplates(
    userId: string,
  ): Promise<WorkoutTemplateWithRecentSetsResponseDto[]> {
    await this.userService.getById(userId);
    const workoutTemplates = await this.workoutTemplateRepo.findMany(userId);

    // Get sets from recent workouts for each exercise in the workoutTemplates array
    const exerciseIds = workoutTemplates
      .map((wt) => wt.workoutTemplateExercises.map((e) => e.exercise.id))
      .flat();
    const recentSets = await this.exerciseService.getRecentSetsForExercises(
      userId,
      exerciseIds,
    );

    return workoutTemplates.map((wt) =>
      WorkoutTemplateWithRecentSetsMapper.fromEntityToDto(wt, recentSets),
    );
  }

  /**
   * Deletes a workout template given the id.
   *
   * @param {string} id
   * @param {string} userId
   *
   * @throws {ResourceNotFoundException}
   * @throws {WorkoutTemplateNotFoundException}
   * @throws {CouldNotDeleteWorkoutTemplateException}
   */
  public async deleteWorkoutTemplate(
    id: string,
    userId: string,
  ): Promise<void> {
    await this.userService.getById(userId);

    const workoutTemplateToDelete = await this.workoutTemplateRepo.findById(
      id,
      userId,
    );

    if (!workoutTemplateToDelete)
      throw new WorkoutTemplateNotFoundException(id);

    try {
      await this.workoutTemplateRepo.delete(workoutTemplateToDelete);
    } catch (e) {
      throw new CouldNotDeleteWorkoutTemplateException(e.message);
    }
  }

  /**
   * Updates the workout template
   * @param {string} workoutTemplateId
   * @param {WorkoutTemplateRequestDto} updateWorkoutTemplateDto
   * @param {string} userId
   * @returns {WorkoutTemplateResponseDto}
   *
   * @throws {ResourceNotFoundException}
   * @throws {WorkoutTemplateNotFoundException}
   * @throws {CouldNotUpdateWorkoutTemplateException}
   * @throws {InvalidOrderException}
   */
  public async updateWorkoutTemplate(
    workoutTemplateId: string,
    updateWorkoutTemplateDto: WorkoutTemplateRequestDto,
    userId: string,
  ): Promise<WorkoutTemplateResponseDto> {
    const user = await this.userService.getById(userId);

    // Check if workout template exists
    const existingWorkoutTemplate = await this.workoutTemplateRepo.findById(
      workoutTemplateId,
      userId,
    );
    if (!existingWorkoutTemplate)
      throw new WorkoutTemplateNotFoundException(workoutTemplateId);

    // Check if exercises in request exist in the database for the user
    const exerciseIds = updateWorkoutTemplateDto.exercises.map(
      (e) => e.exerciseId,
    );
    await this.exerciseService.validateExercisesExist(exerciseIds, user);

    this.validateSequentialOrder(updateWorkoutTemplateDto.exercises);

    // Map the dto to entity
    const workoutTemplateEntity = WorkoutTemplateMapper.fromDtoToEntity(
      updateWorkoutTemplateDto,
      user,
      workoutTemplateId,
    );

    try {
      const updatedWorkoutTemplate = await this.workoutTemplateRepo.update(
        workoutTemplateEntity,
        existingWorkoutTemplate,
        userId,
      );
      if (!updatedWorkoutTemplate)
        throw new WorkoutTemplateNotFoundException(workoutTemplateId);

      return WorkoutTemplateMapper.fromEntityToDto(updatedWorkoutTemplate);
    } catch (e) {
      if (e instanceof WorkoutTemplateNotFoundException) throw e;
      throw new CouldNotUpdateWorkoutTemplateException(workoutTemplateId);
    }
  }

  /**
   * Validates that exercises and sets order starts from 1 and increases sequentially by 1
   * @param {WorkoutTemplateRequestExerciseDto[]} exercises
   *
   * @throws {InvalidOrderException}
   */
  private validateSequentialOrder(
    exercises: WorkoutTemplateRequestExerciseDto[],
  ): void {
    for (let i = 0; i < exercises.length; i++) {
      if (exercises[i].order !== i + 1)
        throw new InvalidOrderException('Exercise', exercises[i].order, i);

      const sets = exercises[i].sets;
      for (let j = 0; j < sets.length; j++) {
        if (sets[j].order !== j + 1)
          throw new InvalidOrderException('Set', sets[j].order, j);
      }
    }
  }
}

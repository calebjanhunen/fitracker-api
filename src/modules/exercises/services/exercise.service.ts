import { Injectable } from '@nestjs/common';

import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { LoggerService } from 'src/common/logger/logger.service';
import { capitalizeFirstLetter } from 'src/common/utils/capitalize-first-letter.util';
import { BodyPartService } from 'src/modules/exercises/services/body-part.service';
import { EquipmentService } from 'src/modules/exercises/services/equipment.service';
import { ExerciseIsNotCustomException } from '../internal-errors/exercise-is-not-custom.exception';
import { ExerciseNotFoundException } from '../internal-errors/exercise-not-found.exception';
import {
  ExerciseModel,
  ExerciseWithWorkoutDetailsModel,
  InsertExerciseModel,
  NumTimesUsedForExerciseModel,
  RecentSetsForExerciseModel,
} from '../models';
import { ExerciseDetailsModel } from '../models/exercise-details.model';
import { ExerciseRepository } from '../repository/exercise.repository';

@Injectable()
export class ExerciseService {
  constructor(
    private readonly bodyPartService: BodyPartService,
    private readonly equipmentService: EquipmentService,
    private readonly exerciseRepo: ExerciseRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(ExerciseService.name);
  }

  /**
   * Creates a custom exercise
   * @param {InsertExerciseModel} exercise
   * @param {string} userId
   * @returns {ExerciseModel}
   *
   * @throws {ResourceNotFoundException}
   */
  public async create(
    exercise: InsertExerciseModel,
    userId: string,
  ): Promise<ExerciseModel> {
    await this.validateBodyPartAndEquipmentExist(
      exercise.bodyPartId,
      exercise.equipmentId,
    );

    exercise.userId = userId;
    const createdExercise = await this.exerciseRepo.create(exercise);
    return createdExercise;
  }

  /**
   * Gets all exercises for a user (default and custom)
   *
   * @param {string} userId
   * @returns {ExerciseModel[]}\
   *
   * @throws {ExerciseNotFoundException}
   */
  public async findAll(userId: string): Promise<ExerciseModel[]> {
    return this.exerciseRepo.findAll(userId);
  }

  public async findById(
    exerciseId: string,
    userId: string,
  ): Promise<ExerciseModel> {
    const exercise = await this.exerciseRepo.findById(exerciseId, userId);
    if (!exercise) {
      throw new ExerciseNotFoundException(exerciseId);
    }

    return exercise;
  }

  public async ensureExerciseExists(
    exerciseId: string,
    userId: string,
  ): Promise<void> {
    const exercise = await this.exerciseRepo.findById(exerciseId, userId);
    if (!exercise) {
      throw new ExerciseNotFoundException(exerciseId);
    }
  }

  /**
   * Validates if the exercises (ids) passed in exist in the database
   * @param {string[]} ids - An array of strings representing the IDs of the exercises to validate.
   * @param {string} userId
   * @returns {void}
   *
   * @throws {ResourceNotFoundException}
   */
  public async validateExercisesExist(
    ids: string[],
    userId: string,
  ): Promise<void> {
    const exercises = await this.exerciseRepo.findByIds(ids, userId);

    if (exercises.length !== ids.length) {
      throw new ResourceNotFoundException('One or more exercises do not exist');
    }
  }

  /**
   * Deletes an exercise
   * @param {string} exerciseId
   * @param {string} userId
   *
   * @throws {ExerciseNotFoundException}
   * @throws {ExerciseIsNotCustomError}
   */
  public async delete(exerciseId: string, userId: string): Promise<void> {
    const exercise = await this.exerciseRepo.findById(exerciseId, userId);
    if (!exercise) {
      throw new ExerciseNotFoundException(exerciseId);
    }

    if (!exercise.isCustom) {
      throw new ExerciseIsNotCustomException();
    }

    await this.exerciseRepo.delete(exercise.id, userId);
  }

  /**
   * Updates the exercise
   * @param {string} exerciseId
   * @param {InsertExerciseModel} exercise
   * @param {string} userId
   * @returns {ExerciseModel}
   *
   * @throws {ExerciseNotFoundException}
   * @throws {ResourceNotFoundException}
   * @throws {ExerciseIsNotCustomError}
   */
  public async update(
    exerciseId: string,
    exercise: InsertExerciseModel,
    userId: string,
  ): Promise<ExerciseModel> {
    const existingExercise = await this.findById(exerciseId, userId);
    await this.validateBodyPartAndEquipmentExist(
      exercise.bodyPartId,
      exercise.equipmentId,
    );

    if (!existingExercise.isCustom) {
      throw new ExerciseIsNotCustomException();
    }
    const updatedExercise = await this.exerciseRepo.update(
      exerciseId,
      exercise,
      userId,
    );
    return {
      ...updatedExercise,
      bodyPart: capitalizeFirstLetter(updatedExercise.bodyPart),
      equipment: capitalizeFirstLetter(updatedExercise.equipment),
    };
  }

  /**
   * Gets all exercises along with workout details about each one.
   *
   * @param {string} userId
   * @returns {ExerciseWithWorkoutDetails[]}
   */
  public async getExerciseWithWorkoutDetails(
    userId: string,
  ): Promise<ExerciseWithWorkoutDetailsModel[]> {
    const allExercises = await this.exerciseRepo.findAll(userId);
    const exercisesWithRecentSets =
      await this.exerciseRepo.getRecentSetsForExercises(userId);
    const exerciseWithNumTimesUsed =
      await this.exerciseRepo.getNumTimesEachExerciseUsed(userId);

    // convert recent sets array to map for quick lookup
    const recentSetsMap = new Map<string, RecentSetsForExerciseModel>();
    exercisesWithRecentSets.forEach((e) => recentSetsMap.set(e.id, e));

    //convert num times used array to map for quick lookup
    const numTimesUsedMap = new Map<string, NumTimesUsedForExerciseModel>();
    exerciseWithNumTimesUsed.forEach((e) => numTimesUsedMap.set(e.id, e));

    return allExercises.map((e) => {
      const numTimesUsed = numTimesUsedMap.get(e.id)?.numTimesUsed;
      return {
        id: e.id,
        name: e.name,
        bodyPart: capitalizeFirstLetter(e.bodyPart),
        equipment: capitalizeFirstLetter(e.equipment),
        numTimesUsed: numTimesUsed ? Number(numTimesUsed) : 0,
        recentSets: recentSetsMap.get(e.id)?.recentSets ?? [],
      };
    });
  }

  public async getExerciseDetails(
    exerciseId: string,
    userId: string,
  ): Promise<ExerciseDetailsModel> {
    const exercise = await this.exerciseRepo.findById(exerciseId, userId);
    if (!exercise) {
      this.logger.warn(
        `User ${userId} tried accessing exercise ${exerciseId} which does not exist.`,
      );
      throw new ExerciseNotFoundException(exerciseId);
    }

    const workoutHistory = await this.exerciseRepo.getExerciseWorkoutHistory(
      exerciseId,
      userId,
    );

    return new ExerciseDetailsModel(exercise, workoutHistory);
  }

  /**
   * Gets body part and equipment by id to see if they exist
   * @param {number} bodyPartId
   * @param {number} equipmentId
   *
   * @throws {ResourceNotFoundException}
   */
  private async validateBodyPartAndEquipmentExist(
    bodyPartId: number,
    equipmentId: number,
  ): Promise<void> {
    const bodyPart = await this.bodyPartService.findById(bodyPartId);
    if (!bodyPart) {
      throw new ResourceNotFoundException(
        `Body part with id ${bodyPartId} not found.`,
      );
    }

    const equipment = await this.equipmentService.findById(equipmentId);
    if (!equipment) {
      throw new ResourceNotFoundException(
        `Equipment with id ${equipmentId} not found.`,
      );
    }
  }
}

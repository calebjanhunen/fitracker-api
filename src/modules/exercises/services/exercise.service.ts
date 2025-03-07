import { Injectable } from '@nestjs/common';

import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { LoggerService } from 'src/common/logger/logger.service';
import { capitalizeFirstLetter } from 'src/common/utils/capitalize-first-letter.util';
import { BodyPartService } from 'src/modules/exercises/services/body-part.service';
import { EquipmentService } from 'src/modules/exercises/services/equipment.service';
import { ExerciseType } from '../enums/exercise-type.enum';
import { ExerciseIsNotCustomException } from '../internal-errors/exercise-is-not-custom.exception';
import { ExerciseNotFoundException } from '../internal-errors/exercise-not-found.exception';
import {
  ExerciseModel,
  InsertExerciseModel,
  NumTimesUsedForExerciseModel,
  RecentSetModel,
  RecentSetsForExerciseModel,
} from '../models';
import { ExerciseDetailsModel } from '../models/exercise-details.model';
import { ExerciseVariationRepository } from '../repository/exercise-variation.repository';
import { ExerciseRepository } from '../repository/exercise.repository';

@Injectable()
export class ExerciseService {
  constructor(
    private readonly bodyPartService: BodyPartService,
    private readonly equipmentService: EquipmentService,
    private readonly exerciseRepo: ExerciseRepository,
    private readonly exerciseVariationRepo: ExerciseVariationRepository,
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
  public async findAll(
    userId: string,
    isForWorkout: boolean,
  ): Promise<ExerciseModel[]> {
    let exercises = await this.exerciseRepo.findAll(userId);

    let exerciseVariations =
      await this.exerciseVariationRepo.getExerciseVariations(userId);

    let numTimesExercisesUsed: NumTimesUsedForExerciseModel[] = [];
    let mostRecentExerciseWorkoutSets: RecentSetsForExerciseModel[] = [];
    let numTimesVariationsUsed: NumTimesUsedForExerciseModel[] = [];
    let mostRecentVariationWorkoutSets: RecentSetsForExerciseModel[] = [];
    if (isForWorkout) {
      [
        numTimesExercisesUsed,
        numTimesVariationsUsed,
        mostRecentExerciseWorkoutSets,
        mostRecentVariationWorkoutSets,
      ] = await Promise.all([
        this.exerciseRepo.getNumTimesEachExerciseUsed(userId),
        this.exerciseVariationRepo.getNumTimesEachVariationUsed(userId),
        this.exerciseRepo.getMostRecentWorkoutSetsForAllExercises(userId),
        this.exerciseVariationRepo.getMostRecentWorkoutSetsForAllVariations(
          userId,
        ),
      ]);
    }

    exercises = this.hydrateExerciseModels(
      exercises,
      numTimesExercisesUsed,
      mostRecentExerciseWorkoutSets,
      ExerciseType.EXERCISE,
      isForWorkout,
    );

    exerciseVariations = this.hydrateExerciseModels(
      exerciseVariations,
      numTimesVariationsUsed,
      mostRecentVariationWorkoutSets,
      ExerciseType.VARIATION,
      isForWorkout,
    );

    return exercises
      .concat(exerciseVariations)
      .sort((a, b) => a.name.localeCompare(b.name));
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

  public async getExerciseDetails(
    exerciseId: string,
    userId: string,
    isVariation: boolean,
  ): Promise<ExerciseDetailsModel> {
    if (isVariation) {
      return await this.getExerciseVariationDetails(exerciseId, userId);
    } else {
      return await this.getBaseExerciseDetails(exerciseId, userId);
    }
  }

  private async getBaseExerciseDetails(
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

    exercise.exerciseType = ExerciseType.EXERCISE;

    const workoutHistory = await this.exerciseRepo.getExerciseWorkoutHistory(
      exerciseId,
      userId,
    );

    const exerciseVariations =
      await this.exerciseVariationRepo.getExerciseVariationsByExerciseId(
        exercise.id,
        userId,
      );

    return new ExerciseDetailsModel(
      exercise,
      workoutHistory,
      exerciseVariations,
    );
  }

  private async getExerciseVariationDetails(
    exerciseVariationId: string,
    userId: string,
  ): Promise<ExerciseDetailsModel> {
    const exerciseVariation =
      await this.exerciseVariationRepo.getExerciseVariationByIdV2(
        exerciseVariationId,
        userId,
      );
    if (!exerciseVariation) {
      this.logger.warn(
        `User ${userId} tried accessing exercise variation ${exerciseVariationId} which does not exist.`,
      );
      throw new ExerciseNotFoundException(exerciseVariationId, true);
    }

    exerciseVariation.exerciseType = ExerciseType.VARIATION;

    const workoutHistory =
      await this.exerciseVariationRepo.getExerciseVariationWorkoutHistory(
        exerciseVariationId,
        userId,
      );

    return new ExerciseDetailsModel(exerciseVariation, workoutHistory, []);
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

  private hydrateExerciseModels(
    exercises: ExerciseModel[],
    numTimesExercisesUsed: NumTimesUsedForExerciseModel[],
    mostRecentWorkoutSetsForExercises: RecentSetsForExerciseModel[],
    exerciseType: ExerciseType,
    isForWorkout: boolean,
  ): ExerciseModel[] {
    return exercises.map((exercise) => {
      const numTimesUsed =
        numTimesExercisesUsed.find((e) => e.id === exercise.id)?.numTimesUsed ??
        0;

      const mostRecentWorkoutSets =
        mostRecentWorkoutSetsForExercises.find((e) => e.id === exercise.id)
          ?.recentSets ?? [];

      return this.hydrateExerciseModel(
        exercise,
        numTimesUsed,
        mostRecentWorkoutSets,
        exerciseType,
        isForWorkout,
      );
    });
  }

  private hydrateExerciseModel(
    exercise: ExerciseModel,
    numTimesExercisesUsed: number,
    mostRecentWorkoutSets: RecentSetModel[],
    exerciseType: ExerciseType,
    isForWorkout: boolean,
  ): ExerciseModel {
    return {
      ...exercise,
      bodyPart: capitalizeFirstLetter(exercise.bodyPart),
      equipment: capitalizeFirstLetter(exercise.equipment),
      numTimesUsed: isForWorkout ? Number(numTimesExercisesUsed) : undefined,
      mostRecentWorkoutSets: isForWorkout ? mostRecentWorkoutSets : undefined,
      exerciseType: exerciseType,
    };
  }
}

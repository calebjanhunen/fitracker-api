import { Injectable } from '@nestjs/common';

import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { BodyPartService } from 'src/modules/body-part/service/body-part.service';
import { EquipmentService } from 'src/modules/equipment/service/equipment.service';
import { ExerciseModel } from '../models/exerise.model';
import { InsertExerciseModel } from '../models/insert-exercise.model';
import { ExerciseRepository } from '../repository/exercise.repository';

@Injectable()
export class ExerciseService {
  constructor(
    private readonly bodyPartService: BodyPartService,
    private readonly equipmentService: EquipmentService,
    private readonly exerciseRepo: ExerciseRepository,
  ) {}

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
    const bodyPart = await this.bodyPartService.findById(exercise.bodyPartId);
    if (!bodyPart) {
      throw new ResourceNotFoundException(
        `Body part with id, ${exercise.bodyPartId}, not found.`,
      );
    }

    const equipment = await this.equipmentService.findById(
      exercise.equipmentId,
    );
    if (!equipment) {
      throw new ResourceNotFoundException(
        `Equipment with id, ${exercise.equipmentId}, not found.`,
      );
    }

    exercise.userId = userId;
    const createdExercise = await this.exerciseRepo.create(exercise);
    return createdExercise;
  }

  /**
   * Gets all exercises for a user (default and custom)
   *
   * @param {string} userId
   * @returns {ExerciseModel[]}
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
      throw new ResourceNotFoundException(
        `Exercise not found with id: ${exerciseId}`,
      );
    }

    return exercise;
  }

  //   /**
  //    * Retrieves exercises by their IDs for a specific user.
  //    * @param {string[]} ids - An array of strings representing the IDs of the exercises to retrieve.
  //    * @param {User} user
  //    * @returns {Exercise[]}
  //    */
  //   public async getExercisesByIds(
  //     ids: string[],
  //     user: User,
  //   ): Promise<Exercise[]> {
  //     return await this.exerciseRepo.getByIds(ids, user);
  //   }

  //   /**
  //    * Checks if each exercise exists in the database.
  //    *
  //    * @param   {string[]}      ids     The id of each exercise to check
  //    * @param   {User}          user    The user that is doing the request
  //    * @returns {Exercise[]}            Array of exercises
  //    *
  //    * @throws {Error}
  //    */
  //   public async validateExercisesExist(
  //     ids: string[],
  //     user: User,
  //   ): Promise<Exercise[]> {
  //     const exercises = await this.exerciseRepo.getByIds(ids, user);
  //     if (exercises.length !== ids.length)
  //       throw new Error('One or more exercises do not exist');

  //     return exercises;
  //   }

  //   /**
  //    * Retrieves exercises for a workout, including information on usage
  //    * frequency and recent sets.
  //    * @param {string} userId
  //    * @returns {ExerciseForWorkout[]}
  //    */
  //   public async getExercisesForWorkout(
  //     userId: string,
  //   ): Promise<ExerciseForWorkout[]> {
  //     let allExercises: Exercise[];
  //     let exerciseUsages: ExerciseUsage[];

  //     // Get all exercises for user
  //     try {
  //       allExercises = await this.exerciseRepo.getAll(userId, {
  //         fields: ['id', 'name', 'primaryMuscle'],
  //       });
  //     } catch (e) {
  //       // TODO: Log error
  //       throw new Error('Could not get exercises');
  //     }

  //     // Get number of times each exercise was used
  //     try {
  //       exerciseUsages = await this.exerciseRepo.getExerciseUsages(userId);
  //     } catch (e) {
  //       // TODO: Log error
  //       throw new Error('Could not number of times exercises were used');
  //     }

  //     const recentSets = await this.getRecentSetsForExercises(userId);

  //     // Convert array of exercise usages to map for time complexity efficiency
  //     const exerciseUsagesMap = new Map(
  //       exerciseUsages.map((res) => [res.exercise_id, res.num_times_used]),
  //     );

  //     // Combine the 3 queries into one array
  //     const exercisesForWorkout: ExerciseForWorkout[] = allExercises.map((e) => {
  //       const prevSets = recentSets.find((prev) => prev.exercise.id === e.id);
  //       return {
  //         ...e,
  //         numTimesUsed: exerciseUsagesMap.get(e.id) || '0',
  //         previousSets: prevSets?.sets || [],
  //       };
  //     });

  //     return exercisesForWorkout;
  //   }

  //   /**
  //    * Gets sets from most recent workout for exercises.
  //    * Gets previous sets for exercises in exerciseIds if provided,
  //    * if not it gets previous sets for all exercises.
  //    *
  //    * @param {string} userId
  //    * @param {string[]} exerciseIds
  //    * @returns {WorkoutExercise[]}
  //    */
  //   public async getRecentSetsForExercises(
  //     userId: string,
  //     exerciseIds?: string[],
  //   ): Promise<WorkoutExercise[]> {
  //     try {
  //       const recentSets = await this.exerciseRepo.getRecentSetsForExercises(
  //         userId,
  //         exerciseIds,
  //       );
  //       return recentSets;
  //     } catch (e) {
  //       // TODO: Log error
  //       throw new Error('Could not get recent sets for exercises');
  //     }
  //   }

  //   /**
  //    * Updates the exercise
  //    * @param {string} exerciseId
  //    * @param {Exercise} exercise
  //    * @param {User} userId
  //    * @returns {Exercise}
  //    *
  //    * @throws {ExerciseNotFoundException}
  //    * @throws {ExerciseDoesNotBelongToUser}
  //    * @throws {ExerciseIsNotCustomError}
  //    */
  //   async updateExercise(
  //     exerciseId: string,
  //     exercise: Exercise,
  //     userId: string,
  //   ): Promise<Exercise> {
  //     const user = await this.userService.getById(userId);

  //     const existingExercise = await this.getSingleExerciseById(
  //       exerciseId,
  //       userId,
  //     );
  //     this.assertExerciseIsCustom(existingExercise);

  //     exercise.user = user;
  //     exercise.id = exerciseId;
  //     const updatedExercise = await this.exerciseRepo.update(exercise);
  //     return updatedExercise;
  //   }

  //   /**
  //    * Deletes an exercise from the db
  //    * @param {string} exerciseId
  //    * @param {string} userId
  //    *
  //    * @throws {ExerciseNotFoundException}
  //    * @throws {ExerciseDoesNotBelongToUser}
  //    * @throws {ExerciseIsNotCustomError}
  //    */
  //   public async deleteExercise(
  //     exerciseId: string,
  //     userId: string,
  //   ): Promise<void> {
  //     const exercise = await this.getSingleExerciseById(exerciseId, userId);
  //     this.assertExerciseIsCustom(exercise);
  //     await this.exerciseRepo.delete(exercise);
  //   }

  //   /**
  //    * Checks if the exercise is a custom exercise, throws error if it's default
  //    * @param {Exercise} exercise
  //    *
  //    * @throws {ExerciseIsNotCustomError}
  //    */
  //   private assertExerciseIsCustom(exercise: Exercise): void {
  //     if (!exercise.user) {
  //       throw new ExerciseIsNotCustomError();
  //     }
  //   }
}

import { Injectable } from '@nestjs/common';

import { CollectionModel, Exercise, User } from 'src/model';
import { ExerciseIsNotCustomError } from 'src/modules/exercises/internal-errors/exercise-is-not-custom.error';
import { UserService } from 'src/modules/user/service/user.service';
import { WorkoutExercise } from 'src/modules/workouts/models/workout-exercises.entity';
import { ExerciseForWorkout } from '../interfaces/exercise-for-workout.interface';
import { ExerciseUsage } from '../interfaces/exercise-usage.interface';
import { ExerciseRepository } from '../repository/exercise.repository';
import { ExerciseNotFoundException } from './exceptions/exercise-not-found.exception';

@Injectable()
export default class ExercisesService {
  constructor(
    private userService: UserService,
    private exerciseRepo: ExerciseRepository,
  ) {}

  /**
   * Creates a custom exercise
   * @param {Exercise} exercise
   * @param {string} userId
   * @returns {Exercise}
   */
  async createExercise(exercise: Exercise, userId: string): Promise<Exercise> {
    const user = await this.userService.getById(userId);
    exercise.user = user;

    const createdExercise = await this.exerciseRepo.create(exercise);
    return createdExercise;
  }

  /**
   * Gets all exercises for a user (default and custom) in paginated format
   *
   * @param {string} userId
   * @param {number} page
   * @param {number} limit
   * @returns {CollectionModel<Exercise>}
   */
  async getExercisesForUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<CollectionModel<Exercise>> {
    await this.userService.getById(userId);

    const exerciseCollectionModel = new CollectionModel<Exercise>();
    const offset = limit * (page - 1);

    const exercises = await this.exerciseRepo.getAll(userId, {
      take: limit,
      skip: offset,
    });

    exerciseCollectionModel.listObjects = exercises;
    exerciseCollectionModel.totalCount = exercises.length;
    exerciseCollectionModel.limit = limit;
    exerciseCollectionModel.offset = offset;

    return exerciseCollectionModel;
  }

  /**
   * Retrieves exercises by their IDs for a specific user.
   * @param {string[]} ids - An array of strings representing the IDs of the exercises to retrieve.
   * @param {User} user
   * @returns {Exercise[]}
   */
  public async getExercisesByIds(
    ids: string[],
    user: User,
  ): Promise<Exercise[]> {
    return await this.exerciseRepo.getByIds(ids, user);
  }

  /**
   * Gets an exercise by its id
   * @param {string} exerciseId
   * @param {string} userId
   * @returns {Exercise}
   *
   * @throws {ExerciseNotFoundException}
   * @throws {ResourceNotFoundException}
   * @throws {EntityNotFoundError}
   */
  public async getSingleExerciseById(
    exerciseId: string,
    userId: string,
  ): Promise<Exercise> {
    await this.userService.getById(userId);

    const exercise = await this.exerciseRepo.getById(exerciseId, userId);

    if (!exercise) throw new ExerciseNotFoundException();

    return exercise;
  }

  /**
   * Retrieves exercises for a workout, including information on usage
   * frequency and recent sets.
   * @param {string} userId
   * @returns {ExerciseForWorkout[]}
   */
  public async getExercisesForWorkout(
    userId: string,
  ): Promise<ExerciseForWorkout[]> {
    let allExercises: Exercise[];
    let exerciseUsages: ExerciseUsage[];
    let recentSets: WorkoutExercise[];

    // Get all exercises for user
    try {
      allExercises = await this.exerciseRepo.getAll(userId, {
        fields: ['id', 'name', 'primaryMuscle'],
      });
    } catch (e) {
      // TODO: Log error
      throw new Error('Could not get exercises');
    }

    // Get number of times each exercise was used
    try {
      exerciseUsages = await this.exerciseRepo.getExerciseUsages(userId);
    } catch (e) {
      // TODO: Log error
      throw new Error('Could not number of times exercises were used');
    }

    // Get the most recent usage of each exercise (sets from most recent workout)
    try {
      recentSets = await this.exerciseRepo.getRecentSetsForExercises(userId);
    } catch (e) {
      // TODO: Log error
      throw new Error('Could not get recent sets for exercises');
    }

    // Convert array of exercise usages to map for time complexity efficiency
    const exerciseUsagesMap = new Map(
      exerciseUsages.map((res) => [res.exercise_id, res.num_times_used]),
    );

    // Combine the 3 queries into one array
    const exercisesForWorkout: ExerciseForWorkout[] = allExercises.map((e) => {
      const prevSets = recentSets.find((prev) => prev.exercise.id === e.id);
      return {
        ...e,
        numTimesUsed: exerciseUsagesMap.get(e.id) || '0',
        previousSets: prevSets?.sets || [],
      };
    });

    return exercisesForWorkout;
  }

  /**
   * Updates the exercise
   * @param {string} exerciseId
   * @param {Exercise} exercise
   * @param {User} userId
   * @returns {Exercise}
   *
   * @throws {ExerciseNotFoundException}
   * @throws {ExerciseDoesNotBelongToUser}
   * @throws {ExerciseIsNotCustomError}
   */
  async updateExercise(
    exerciseId: string,
    exercise: Exercise,
    userId: string,
  ): Promise<Exercise> {
    const user = await this.userService.getById(userId);

    const existingExercise = await this.getSingleExerciseById(
      exerciseId,
      userId,
    );
    this.assertExerciseIsCustom(existingExercise);

    exercise.user = user;
    exercise.id = exerciseId;
    const updatedExercise = await this.exerciseRepo.update(exercise);
    return updatedExercise;
  }

  /**
   * Deletes an exercise from the db
   * @param {string} exerciseId
   * @param {string} userId
   *
   * @throws {ExerciseNotFoundException}
   * @throws {ExerciseDoesNotBelongToUser}
   * @throws {ExerciseIsNotCustomError}
   */
  public async deleteExercise(
    exerciseId: string,
    userId: string,
  ): Promise<void> {
    const exercise = await this.getSingleExerciseById(exerciseId, userId);
    this.assertExerciseIsCustom(exercise);
    await this.exerciseRepo.delete(exercise);
  }

  /**
   * Checks if the exercise is a custom exercise, throws error if it's default
   * @param {Exercise} exercise
   *
   * @throws {ExerciseIsNotCustomError}
   */
  private assertExerciseIsCustom(exercise: Exercise): void {
    if (!exercise.user) {
      throw new ExerciseIsNotCustomError();
    }
  }
}

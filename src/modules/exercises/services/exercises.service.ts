import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CollectionModel, Exercise, User } from 'src/model';
import { ExerciseIsNotCustomError } from 'src/modules/exercises/internal-errors/exercise-is-not-custom.error';
import { ExerciseDoesNotBelongToUser } from './exceptions/exercise-does-not-belong-to-user.exception';
import { ExerciseNotFoundException } from './exceptions/exercise-not-found.exception';

@Injectable()
export default class ExercisesService {
  private exerciseRepo: Repository<Exercise>;

  constructor(@InjectRepository(Exercise) exerciseRepo: Repository<Exercise>) {
    this.exerciseRepo = exerciseRepo;
  }

  /**
   * Gets the default exercises and user created exercises form the database
   *
   * @param {User} user
   * @param {number} page
   * @param {number} limit
   * @returns {CollectionModel<Exercise>}
   */
  async getDefaultAndUserCreatedExercises(
    user: User,
    page: number,
    limit: number,
  ): Promise<CollectionModel<Exercise>> {
    const exerciseCollectionModel = new CollectionModel<Exercise>();
    const offset = limit * (page - 1);

    const [exercises, totalCount] = await this.exerciseRepo.findAndCount({
      where: [{ isCustom: false }, { user: { id: user.id } }],
      take: limit,
      skip: offset,
      order: {
        name: 'ASC',
      },
    });

    exerciseCollectionModel.listObjects = exercises;
    exerciseCollectionModel.totalCount = totalCount;
    exerciseCollectionModel.limit = limit;
    exerciseCollectionModel.offset = offset;

    return exerciseCollectionModel;
  }

  /**
   * Retrieves default and user created exercises based on the provided user ID and optional
   * fields.
   * @param {string} userId - A string that represents the unique identifier of the user for whom we want to find exercises.
   * @param {(keyof Exercise)[]} [fields] - An optional array of fields from the `Exercise` entity. If provided, only the specified fields
   * will be selected in the query result. If not provided, all fields of the `Exercise` entity will be
   * selected.
   *
   * @returns {Exercise[]} - An array of Exercise objects.
   */
  public async findAllExercises(
    userId: string,
    fields?: (keyof Exercise)[],
  ): Promise<Exercise[]> {
    const query = this.exerciseRepo.createQueryBuilder('exercise');

    if (fields && fields.length > 0) {
      const selectQuery = fields.map((field) => `exercise.${field}`);
      query.select(selectQuery);
    }

    query.where('exercise.is_custom = false or exercise.user_id = :userId', {
      userId,
    });

    query.orderBy('exercise.name', 'ASC');

    const result = await query.getMany();
    return result;
  }

  /**
   * Creates a custom exercise
   * @param {Exercise} exercise
   * @returns {Exercise}
   */
  async createCustomExercise(exercise: Exercise): Promise<Exercise> {
    const createdExercise = await this.exerciseRepo.save(exercise);
    return createdExercise;
  }

  /**
   * Gets an exercise by its id
   * @param {string} exerciseId
   * @param {string} userId
   * @returns {Exercise}
   *
   * @throws {ResourceNotFoundException}
   * @throws {ExerciseUserDoesNotMatchUserInRequestError}
   */
  async getById(exerciseId: string, userId: string): Promise<Exercise> {
    const exercise = await this.exerciseRepo.findOne({
      where: { id: exerciseId },
      relations: { user: true },
    });

    if (!exercise) {
      throw new ExerciseNotFoundException();
    }

    this.assertExerciseBelongsToUser(exercise, userId);

    return exercise;
  }

  /**
   * Updates the exercise
   * @param {string} id
   * @param {User} user
   * @returns {Exercise}
   *
   * @throws {ExerciseNotFoundException}
   * @throws {ExerciseDoesNotBelongToUser}
   * @throws {ExerciseIsNotCustomError}
   */
  async update(id: string, exercise: Exercise, user: User): Promise<Exercise> {
    const existingExercise = await this.getById(id, user.id);
    this.assertExerciseIsCustom(existingExercise);

    exercise.user = user;
    exercise.id = id;
    const updatedExercise = await this.exerciseRepo.save(exercise);
    return updatedExercise;
  }

  /**
   * Deletes an exercise from the db
   * @param {string} id
   * @param {User} user
   *
   * @throws {ExerciseNotFoundException}
   * @throws {ExerciseDoesNotBelongToUser}
   * @throws {ExerciseIsNotCustomError}
   */
  public async deleteById(id: string, user: User): Promise<void> {
    const exercise = await this.getById(id, user.id);
    this.assertExerciseIsCustom(exercise);
    await this.exerciseRepo.remove(exercise);
  }

  /**
   * Checks if the exercise belongs to the user that requested it
   * @param {Exercise} exercise
   * @param {string} userId
   *
   * @throws {ExerciseDoesNotBelongToUser}
   */
  private assertExerciseBelongsToUser(
    exercise: Exercise,
    userId: string,
  ): void {
    if (exercise.user && exercise.user.id !== userId) {
      throw new ExerciseDoesNotBelongToUser();
    }
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

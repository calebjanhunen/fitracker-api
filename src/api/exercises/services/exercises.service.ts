import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExerciseUserDoesNotMatchUserInRequestError } from 'src/api/utils/internal-errors/ExerciseUserDoesNotMatchUserInRequestError';
import { ExerciseIsNotCustomError } from 'src/api/utils/internal-errors/exercise-is-not-custom.error';
import { CollectionModel, Exercise, User } from 'src/model';
import { EntityNotFoundError, Repository } from 'typeorm';

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
   * @param {string} id
   * @param {User} user
   * @returns {Exercise}
   *
   * @throws {EntityNotFoundError}
   * @throws {ExerciseUserDoesNotMatchUserInRequestError}
   */
  async getById(id: string, user: User): Promise<Exercise> {
    let exercise: Exercise;
    try {
      exercise = await this.exerciseRepo.findOneOrFail({
        where: { id },
        relations: { user: true },
      });
    } catch (error) {
      throw new EntityNotFoundError(Exercise, '');
    }

    this.assertExerciseUserMatchesUserInRequest(exercise, user);

    return exercise;
  }

  /**
   * Updates the exercise
   * @param {string} id
   * @param {User} user
   * @returns {Exercise}
   *
   * @throws {EntityNotFoundError}
   * @throws {ExerciseUserDoesNotMatchUserInRequestError}
   * @throws {ExerciseIsNotCustomError}
   */
  async update(id: string, exercise: Exercise, user: User): Promise<Exercise> {
    const existingExercise = await this.getById(id, user);
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
   * @throws {EntityNotFoundError}
   * @throws {ExerciseUserDoesNotMatchUserInRequestError}
   * @throws {ExerciseIsNotCustomError}
   */
  public async deleteById(id: string, user: User): Promise<void> {
    const exercise = await this.getById(id, user);
    this.assertExerciseIsCustom(exercise);
    await this.exerciseRepo.remove(exercise);
  }

  /**
   * Asserts if user the exercise belongs to is the same as the user in the request
   * @param {Exercise} exercise
   * @param {User} user
   *
   * @throws {ExerciseUserDoesNotMatchUserInRequestError}
   */
  private assertExerciseUserMatchesUserInRequest(
    exercise: Exercise,
    user: User,
  ): void {
    if (exercise.user && exercise.user.id !== user.id) {
      throw new ExerciseUserDoesNotMatchUserInRequestError();
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

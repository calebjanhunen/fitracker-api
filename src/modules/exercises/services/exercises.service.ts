import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CollectionModel, Exercise, User } from 'src/model';
import { ExerciseIsNotCustomError } from 'src/modules/utils/internal-errors/exercise-is-not-custom.error';
import { Repository } from 'typeorm';
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

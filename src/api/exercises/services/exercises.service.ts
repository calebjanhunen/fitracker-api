import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CollectionModel, Exercise, User } from 'src/model';
import { Repository } from 'typeorm';

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
}

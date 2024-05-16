import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Exercise, User } from 'src/model';
import { UserService } from 'src/modules/user/service/user.service';
import { ExerciseDifficultyLevel } from 'src/modules/utils/enums/exercise-difficulty-level';
import { Repository } from 'typeorm';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const jsonExerciseData = require('./exercise-seed-data.json');

interface IExerciseSeedData {
  name: string;
  difficultyLevel: string;
  equipment: string;
  primaryMuscle: string;
  secondaryMuscles: string[];
  isCustom: boolean;
  user: User | null;
  instructions: string[];
}

@Injectable()
export class ExerciseSeederService {
  private exerciseRepo;
  private userService;
  private NUM_OF_USER_CREATED_EXERCISES_TO_INSERT = 1;

  constructor(
    @InjectRepository(Exercise) exerciseRepo: Repository<Exercise>,
    userService: UserService,
  ) {
    this.exerciseRepo = exerciseRepo;
    this.userService = userService;
  }

  /**
   * Inserts default exercises and user created exercises into the db
   * @param {string[]} userIds
   * @returns {Promise<number | undefined>} number of exercises inserted
   */
  async create(userIds: string[]): Promise<number | undefined> {
    try {
      let allExercises: Exercise[] = [];

      const defaultExercises =
        this.fromJsonSeedDataToExerciseEntities(jsonExerciseData);

      const userCreatedExercises =
        await this.generateUserCreatedExerciseEntities(userIds);

      // Combine default exercises and user created exercises
      allExercises = [...defaultExercises, ...userCreatedExercises];

      let numExercisesInserted = 0;
      for (const exercise of allExercises) {
        await this.exerciseRepo.save(exercise);
        numExercisesInserted++;
      }

      return numExercisesInserted;
    } catch (error) {
      throw error;
    }
  }

  async deleteAllExercises(): Promise<void> {
    try {
      await this.exerciseRepo
        .createQueryBuilder()
        .delete()
        .where('id IS NOT NULL')
        .execute();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Converts default exercise json data to array of exercise entities
   * @param {IExerciseSeedData[]} exerciseSeedData
   * @returns {Exercise[]} array of exercise entities
   */
  private fromJsonSeedDataToExerciseEntities(
    exerciseSeedData: IExerciseSeedData[],
  ): Exercise[] {
    const exercises: Exercise[] = [];
    for (const seedExercise of exerciseSeedData) {
      const defaultExercise =
        this.createDefaultExerciseFromSeedData(seedExercise);
      exercises.push(defaultExercise);
    }

    return exercises;
  }

  /**
   * Generates NUM_OF_USER_CREATED_EXERCISES_TO_INSERT number of user created exercises for each user
   * @param {string[]} userIds
   * @returns {Promise<Exercise[]>} array of exercise entities
   */
  private async generateUserCreatedExerciseEntities(
    userIds: string[],
  ): Promise<Exercise[]> {
    const userCreatedExercises: Exercise[] = [];

    // Loop through each seed user
    for (const userId of userIds) {
      // Insert NUM_OF_USER_CREATED_EXERCISES_TO_INSERT number of exercises for each seed user
      for (let i = 0; i < this.NUM_OF_USER_CREATED_EXERCISES_TO_INSERT; i++) {
        const testUser = await this.userService.getById(userId);
        if (!testUser) {
          continue;
        }

        const exercise = this.createUserCreatedExerciseFromUser(testUser);
        userCreatedExercises.push(exercise);
      }
    }

    return userCreatedExercises;
  }

  /**
   * Creates a user created exercise.
   * @param {User} user
   * @returns {IExerciseSeedData}
   */
  private createUserCreatedExerciseFromUser(user: User): Exercise {
    const exercise = new Exercise();
    exercise.name = `Test Exercise: ${user.firstName}`;
    exercise.difficultyLevel = ExerciseDifficultyLevel.beginner;
    exercise.equipment = 'dumbbells';
    exercise.instructions = ['Step 1.', 'Step 2.', 'Step 3', 'Step 4'];
    exercise.primaryMuscle = 'bicep';
    exercise.secondaryMuscles = ['forearm'];
    exercise.isCustom = true;
    exercise.user = user;
    return exercise;
  }

  /**
   * Creates an exercise entity from a seed exercise
   * @param {IExerciseSeedData} seedExercise
   * @returns {Exercise}
   */
  private createDefaultExerciseFromSeedData(
    seedExercise: IExerciseSeedData,
  ): Exercise {
    const exercise = new Exercise();
    exercise.name = seedExercise.name;
    exercise.difficultyLevel = ExerciseDifficultyLevel.beginner;
    exercise.equipment = seedExercise.equipment;
    exercise.instructions = seedExercise.instructions;
    exercise.primaryMuscle = seedExercise.primaryMuscle;
    exercise.secondaryMuscles = seedExercise.secondaryMuscles;
    exercise.isCustom = seedExercise.isCustom;
    exercise.user = null;
    return exercise;
  }
}

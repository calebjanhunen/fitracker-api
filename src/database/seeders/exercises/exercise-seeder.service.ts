import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/api/user/service/user.service';
import { IExercise } from 'src/interfaces';
import { Exercise } from 'src/model';
import { Repository } from 'typeorm';
import {
  createUserCreatedExercise,
  defaultExercisesSeedData,
} from './exercise-seed-data';

@Injectable()
export class ExerciseSeederService {
  private exerciseRepo;
  private userService;
  private NUM_OF_USER_CREATED_WORKOUTS_TO_INSERT = 1;

  constructor(
    @InjectRepository(Exercise) exerciseRepo: Repository<Exercise>,
    userService: UserService,
  ) {
    this.exerciseRepo = exerciseRepo;
    this.userService = userService;
  }

  async create(userIds: string[]): Promise<number | undefined> {
    try {
      let allExercises: IExercise[] = [];

      //Generate user created workouts for seed users
      const userCreatedExercises: IExercise[] =
        await this.generateUserCreatedExercises(userIds);

      // Combine user created exercises and default exercises from defaultExercisesSeedData
      allExercises = [...defaultExercisesSeedData, ...userCreatedExercises];

      let numExercisesInserted = 0;
      for (const exercise of allExercises) {
        await this.exerciseRepo.insert(exercise);
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

  private async generateUserCreatedExercises(
    userIds: string[],
  ): Promise<IExercise[]> {
    const userCreatedExercises: IExercise[] = [];

    // Loop through each seed user
    for (const userId of userIds) {
      // Insert NUM_OF_USER_CREATED_WORKOUTS_TO_INSERT number of exercises for each seed user
      for (let i = 0; i < this.NUM_OF_USER_CREATED_WORKOUTS_TO_INSERT; i++) {
        const testUser = await this.userService.getById(userId);
        if (!testUser) {
          continue;
        }

        const exercise = createUserCreatedExercise(testUser);
        userCreatedExercises.push(exercise);
      }
    }

    return userCreatedExercises;
  }
}

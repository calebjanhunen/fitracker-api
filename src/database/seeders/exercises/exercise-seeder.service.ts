import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/api/user/service/user.service';
import { Exercise, User } from 'src/model';
import { Repository } from 'typeorm';
import {
  createUserCreatedExercise,
  exerciseSeedData,
} from './exercise-seed-data';

@Injectable()
export class ExerciseSeederService {
  private exerciseRepo;
  private userService;

  constructor(
    @InjectRepository(Exercise) exerciseRepo: Repository<Exercise>,
    userService: UserService,
  ) {
    this.exerciseRepo = exerciseRepo;
    this.userService = userService;
  }

  async create(): Promise<number | undefined> {
    try {
      // Get user to add user created exercises to exercise seed data
      const testUser = await this.userService.getByUsername('caleb_test');
      if (!testUser) {
        throw new Error('user not found');
      }

      // Add user created exercises to exercise seed data
      const exercisesWithUserCreatedExercises =
        this.addUserCreatedExercises(testUser);

      let numExercisesInserted = 0;
      for (const exercise of exercisesWithUserCreatedExercises) {
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

  private addUserCreatedExercises(user: User): Exercise[] {
    const userCreatedExercise = createUserCreatedExercise(user);
    return [...exerciseSeedData, userCreatedExercise];
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Exercise, Set, User, Workout } from 'src/model';
import ExercisesService from 'src/modules/exercises/services/exercises.service';
import { UserService } from 'src/modules/user/service/user.service';
import { WorkoutsService } from 'src/modules/workouts/service/workouts.service';
import { Repository } from 'typeorm';

@Injectable()
export class WorkoutSeederService {
  private workoutRepo;
  private workoutService;
  private userService;
  private exerciseService;

  constructor(
    @InjectRepository(Workout) workoutRepo: Repository<Workout>,
    workoutService: WorkoutsService,
    userService: UserService,
    exerciseService: ExercisesService,
  ) {
    this.workoutRepo = workoutRepo;
    this.workoutService = workoutService;
    this.userService = userService;
    this.exerciseService = exerciseService;
  }

  /**
   * Inserts workouts for users
   * @param {string[]} userIds
   * @param {number} numExercises
   * @returns {number} number of workouts inserted
   */
  public async create(
    userIds: string[],
    numExercises: number,
  ): Promise<number> {
    let numWorkoutsInserted = 0;
    for (const userId of userIds) {
      numWorkoutsInserted += await this.insertWorkoutsForUser(
        userId,
        numExercises,
      );
    }

    return numWorkoutsInserted;
  }

  private async insertWorkoutsForUser(userId: string, numExercises: number) {
    const user = await this.userService.getById(userId);
    const allExercises =
      await this.exerciseService.getDefaultAndUserCreatedExercises(
        user,
        1,
        numExercises,
      );

    const numWorkoutsToInsert = this.getRandomNumber(1, 3);
    for (let i = 0; i < numWorkoutsToInsert; i++) {
      const workout = this.createWorkoutObject(
        i,
        user,
        allExercises.listObjects,
        numExercises,
      );

      await this.workoutService.createWorkout(workout);
    }

    return numWorkoutsToInsert;
  }

  private createWorkoutObject(
    index: number,
    user: User,
    allExercises: Exercise[],
    numExercises: number,
  ): Workout {
    const workout = new Workout();
    workout.name = `Seed Workout ${index + 1} for ${user.username}`;
    workout.user = user;
    workout.exercises = [];

    const numExercisesToInsert = this.getRandomNumber(3, 6);
    for (let i = 0; i < numExercisesToInsert; i++) {
      const alreadyInsertedExerciseIndexes: number[] = [];

      // Gets a random exercise from the list of exercises retrieved from the db
      const randomExerciseIndex = this.getRandomExerciseIndex(
        alreadyInsertedExerciseIndexes,
        numExercises,
      );
      const exercise = allExercises[randomExerciseIndex];
      exercise.sets = [];

      const numSetsToInsert = this.getRandomNumber(2, 4);
      for (let i = 0; i < numSetsToInsert; i++) {
        const set = this.createSetObject(exercise);
        exercise.sets.push(set);
      }
      workout.exercises.push(exercise);
    }

    return workout;
  }

  private getRandomExerciseIndex(
    alreadyInsertedExerciseIndexes: number[],
    numExercises: number,
  ): number {
    let randomExerciseIndex = -1;

    // Check to see if index of exercise already exists in workout since workout can only contain an exercise once
    while (
      randomExerciseIndex < 0 ||
      alreadyInsertedExerciseIndexes.includes(randomExerciseIndex)
    ) {
      randomExerciseIndex = this.getRandomNumber(0, numExercises - 1);
    }

    return randomExerciseIndex;
  }

  private createSetObject(exercise: Exercise): Set {
    const set = new Set();
    set.exercise = exercise;
    set.reps = Math.floor(Math.random() * (12 - 6) + 6);
    set.weight = Math.floor(Math.random() * (100 - 60) + 60);
    set.rpe = Math.floor(Math.random() * (10 - 8) + 8);

    return set;
  }

  public async deleteAllWorkouts(): Promise<void> {
    try {
      await this.workoutRepo
        .createQueryBuilder()
        .delete()
        .where('id IS NOT NULL')
        .execute();
    } catch (error) {
      throw error;
    }
  }

  private getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min) + min);
  }
}

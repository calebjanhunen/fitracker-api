import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import ExercisesService from 'src/api/exercises/services/exercises.service';
import { User, Workout } from 'src/model';
import { DataSource, Repository } from 'typeorm';
import { CouldNotDeleteWorkoutException } from './exceptions/could-not-delete-workout.exception';
import { CouldNotSaveSetException } from './exceptions/could-not-save-set.exception';
import { CouldNotSaveWorkoutException } from './exceptions/could-not-save-workout.exception';
import { WorkoutNotFoundException } from './exceptions/workout-not-found.exception';

@Injectable()
export class WorkoutsService {
  private workoutRepo: Repository<Workout>;
  private dataSource: DataSource;
  private exercisesService: ExercisesService;

  constructor(
    @InjectRepository(Workout) workoutRepo: Repository<Workout>,
    dataSource: DataSource,
    exercisesService: ExercisesService,
  ) {
    this.workoutRepo = workoutRepo;
    this.dataSource = dataSource;
    this.exercisesService = exercisesService;
  }

  /**
   * Saves a workout to the database
   * @param {Workout} workout
   * @returns {Workout} Created Workout
   *
   * @throws {ExerciseNotFoundException}
   * @throws {CouldNotSaveSetException}
   * @throws {CouldNotSaveWorkoutException}
   * @throws {WorkoutNotFoundException}
   */
  async createWorkout(workout: Workout): Promise<Workout> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (const workoutExercise of workout.exercises) {
        // Ensure exercise exists in database
        await this.exercisesService.getById(
          workoutExercise.id,
          workout.user.id,
        );

        // Save all sets in the exercise
        try {
          await queryRunner.manager.save(workoutExercise.sets);
        } catch (err) {
          throw new CouldNotSaveSetException();
        }
      }

      // Save workout (also inserts workout id and exercise id into workout_exercises table)
      let createdWorkout: Workout;
      try {
        createdWorkout = await queryRunner.manager.save(workout);
      } catch (err) {
        throw new CouldNotSaveWorkoutException(workout.name);
      }

      await queryRunner.commitTransaction();
      return await this.getById(createdWorkout.id, createdWorkout.user.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Gets a workout by its id.
   * @param {string} workoutId The id of the workout.
   * @param {string} userId    The id of the user.
   * @return {Workout}
   *
   * @throws {WorkoutNotFoundException}
   */
  async getById(workoutId: string, userId: string): Promise<Workout> {
    const workout = await this.workoutRepo.findOne({
      where: { id: workoutId, user: { id: userId } },
      relations: ['exercises', 'exercises.sets'],
    });

    if (!workout) {
      throw new WorkoutNotFoundException();
    }

    return workout;
  }

  /**
   * Gets all workouts for a given user
   * @param {User} user
   * @returns {Workout[]}
   */
  async getWorkouts(user: User): Promise<Workout[]> {
    const workouts = await this.workoutRepo.find({
      where: { user: { id: user.id } },
      relations: ['exercises', 'exercises.sets'],
    });

    return workouts;
  }

  /**
   * Deletes a workout given its id
   *
   * @param {string} workoutId
   * @param {string} userId
   *
   * @throws {CouldNotDeleteWorkoutException}
   */
  async deleteById(workoutId: string, userId: string): Promise<void> {
    try {
      await this.workoutRepo.delete({
        id: workoutId,
        user: { id: userId },
      });
    } catch (err) {
      throw new CouldNotDeleteWorkoutException();
    }
  }
}

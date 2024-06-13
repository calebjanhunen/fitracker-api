import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Set, Workout } from 'src/model';
import { WorkoutExercise } from 'src/model/workout-exercises.entity';
import { ExerciseForWorkout } from 'src/modules/exercises/interfaces/exercise-for-workout.interface';
import ExercisesService from 'src/modules/exercises/services/exercises.service';
import { UserService } from 'src/modules/user/service/user.service';
import { CreateWorkoutRequestDTO } from 'src/modules/workouts/dtos/create-workout-request.dto';
import { DataSource, Repository } from 'typeorm';
import { CouldNotDeleteWorkoutException } from '../internal-errors/could-not-delete-workout.exception';
import { CouldNotSaveSetException } from '../internal-errors/could-not-save-set.exception';
import { CouldNotSaveWorkoutException } from '../internal-errors/could-not-save-workout.exception';
import { WorkoutNotFoundException } from '../internal-errors/workout-not-found.exception';

@Injectable()
export class WorkoutsService {
  constructor(
    @InjectRepository(Workout) private workoutRepo: Repository<Workout>,
    @InjectRepository(WorkoutExercise)
    private workoutExerciseRepo: Repository<WorkoutExercise>,
    private exercisesService: ExercisesService,
    private userService: UserService,
    private dataSource: DataSource,
  ) {}

  /**
   * Saves a workout to the database
   * @param {CreateWorkoutRequestDTO} CreateWorkoutRequestDTO
   * @param {string} userId
   * @returns {Workout} Created Workout
   *
   * @throws {ExerciseNotFoundException}
   * @throws {ExerciseDoesNotBelongToUser}
   * @throws {CouldNotSaveSetException}
   * @throws {CouldNotSaveWorkoutException}
   * @throws {WorkoutNotFoundException}
   */
  async createWorkout(
    CreateWorkoutRequestDTO: CreateWorkoutRequestDTO,
    userId: string,
  ): Promise<Workout> {
    let savedWorkout: Workout;
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
    } catch (e) {
      await queryRunner.release();
      throw e;
    }
    try {
      const user = await this.userService.getById(userId);

      const newWorkout = queryRunner.manager.create(
        Workout,
        CreateWorkoutRequestDTO,
      );
      newWorkout.user = user;

      try {
        savedWorkout = await queryRunner.manager.save(newWorkout);
      } catch (e) {
        throw new CouldNotSaveWorkoutException(CreateWorkoutRequestDTO.name);
      }

      for (const exerciseDTO of CreateWorkoutRequestDTO.exercises) {
        const foundExercise = await this.exercisesService.getById(
          exerciseDTO.id,
          userId,
        );
        const newWorkoutExercise = queryRunner.manager.create(WorkoutExercise, {
          workout: savedWorkout,
          exercise: foundExercise,
        });
        const savedWorkoutExercise =
          await queryRunner.manager.save(newWorkoutExercise);

        for (const setDTO of exerciseDTO.sets) {
          const newSet = queryRunner.manager.create(Set, {
            ...setDTO,
            workoutExercise: savedWorkoutExercise,
          });

          try {
            await queryRunner.manager.save(newSet);
          } catch (e) {
            throw new CouldNotSaveSetException();
          }
        }
      }

      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }

    const createdWorkout = await this.getById(savedWorkout.id, userId);

    return createdWorkout;
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
    await this.userService.getById(userId);

    const workout = await this.workoutRepo.findOne({
      where: { id: workoutId, user: { id: userId } },
      relations: [
        'workoutExercise',
        'workoutExercise.exercise',
        'workoutExercise.sets',
      ],
    });

    if (!workout) {
      throw new WorkoutNotFoundException();
    }

    return workout;
  }

  /**
   * Gets all workouts for a given user
   * @param {string} userId
   * @returns {Workout[]}
   */
  async getWorkouts(userId: string): Promise<Workout[]> {
    await this.userService.getById(userId);

    const workouts = await this.workoutRepo.find({
      where: { user: { id: userId } },
      relations: [
        'workoutExercise',
        'workoutExercise.exercise',
        'workoutExercise.sets',
      ],
      order: {
        createdAt: 'DESC',
      },
    });

    return workouts;
  }

  /**
   * Retrieves exercises for a workout based on a user ID.
   * @param {string} userId - String representing the id of the user.
   * @returns {ExerciseForWorkout[]} Array of Exercise objects with the properties 'id', 'name', 'primaryMuscle' and 'numTimesUsed'.
   */
  public async getExercisesForWorkout(
    userId: string,
  ): Promise<ExerciseForWorkout[]> {
    // find all exercises
    const exercises = await this.exercisesService.findAllExercises(userId, [
      'id',
      'name',
      'primaryMuscle',
    ]);

    // Get number of times each exercise was used in a workout for the user
    const query = this.workoutExerciseRepo.createQueryBuilder('we');
    query
      .select('we.exercise_id', 'exercise_id')
      .addSelect('COUNT(we.exercise_id)', 'num_times_used')
      .groupBy('we.exercise_id')
      .innerJoin('workouts', 'w', 'w.id = we.workout_id')
      .where('w.user_id = :userId', { userId });
    const result = await query.getRawMany<{
      exercise_id: string;
      num_times_used: string;
    }>();

    // Combine both queries into one array of exercises
    const numTimesUsedMap = new Map(
      result.map((res) => [res.exercise_id, res.num_times_used]),
    );
    const exercisesForWorkout: ExerciseForWorkout[] = exercises.map((e) => ({
      ...e,
      numTimesUsed: numTimesUsedMap.get(e.id) || '0',
    }));

    return exercisesForWorkout;
  }

  /**
   * Deletes a workout given its id
   *
   * @param {string} workoutId
   * @param {string} userId
   *
   * @throws {CouldNotDeleteWorkoutException}
   * @throws {WorkoutNotFoundException}
   */
  async deleteById(workoutId: string, userId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    // throws WorkoutNotFoundException if workout does not exist
    await this.getById(workoutId, userId);

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const workoutExercises = await queryRunner.manager.find(WorkoutExercise, {
        where: { workout: { id: workoutId } },
      });
      for (const workoutExercise of workoutExercises) {
        await queryRunner.manager.delete(Set, {
          workoutExercise: { id: workoutExercise.id },
        });
      }

      await queryRunner.manager.delete(WorkoutExercise, {
        workout: { id: workoutId },
      });

      await queryRunner.manager.delete(Workout, { id: workoutId });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new CouldNotDeleteWorkoutException();
    } finally {
      await queryRunner.release();
    }
  }
}

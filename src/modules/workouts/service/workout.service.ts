import { Injectable } from '@nestjs/common';
import { ExerciseService } from 'src/modules/exercises/services/exercise.service';
import { UserService } from 'src/modules/user/service/user.service';
import { WorkoutNotFoundException } from '../internal-errors/workout-not-found.exception';
import { WorkoutModel } from '../models';
import { WorkoutRepository } from '../repository/workout.repository';

@Injectable()
export class WorkoutService {
  constructor(
    private exercisesService: ExerciseService,
    private userService: UserService,
    private workoutRepo: WorkoutRepository,
  ) {}

  /**
   * Gets a workout by its id.
   * @param {string} workoutId The id of the workout.
   * @param {string} userId    The id of the user.
   * @return {Workout}
   *
   * @throws {WorkoutNotFoundException}
   */
  async findById(workoutId: string, userId: string): Promise<WorkoutModel> {
    const workout = await this.workoutRepo.findById(workoutId, userId);

    if (!workout) throw new WorkoutNotFoundException();

    return workout;
  }

  // /**
  //  * Validates exercises exist, maps workout dto to entity
  //  * and saves the workout
  //  * @param {CreateWorkoutRequestDTO} workoutDto
  //  * @param {string} userId
  //  * @returns {WorkoutResponseDto} Created Workout
  //  *
  //  * @throws {EntityNotFoundError}
  //  * @throws {CouldNotSaveWorkoutException}
  //  */
  // async createWorkout(
  //   workoutDto: CreateWorkoutRequestDTO,
  //   userId: string,
  // ): Promise<Workout> {
  //   const user = await this.userService.getById(userId);

  //   // Get existing exercises from db using ids in workout dto
  //   const exerciseIds = workoutDto.exercises.map((e) => e.id);
  //   const foundExercises = await this.exercisesService.getExercisesByIds(
  //     exerciseIds,
  //     user,
  //   );

  //   // assert all exercises in dto exist in db
  //   if (foundExercises.length !== exerciseIds.length)
  //     throw new Error('One or more exercises do not exist');

  //   const workoutEntity = WorkoutMapper.fromDtoToEntity(
  //     workoutDto,
  //     foundExercises,
  //     user,
  //   );

  //   const createdWorkout = await this.workoutRepo.saveWorkout(workoutEntity);

  //   return createdWorkout;
  // }

  // /**
  //  * Gets all workouts for a given user
  //  * @param {string} userId
  //  * @returns {Workout[]}
  //  */
  // async getWorkouts(userId: string): Promise<Workout[]> {
  //   await this.userService.getById(userId);

  //   const workouts = await this.workoutRepo.getMany(userId);

  //   return workouts;
  // }

  // /**
  //  * Deletes a workout given its id
  //  *
  //  * @param {string} workoutId
  //  * @param {string} userId
  //  *
  //  * @throws {CouldNotDeleteWorkoutException}
  //  * @throws {WorkoutNotFoundException}
  //  */
  // async deleteWorkout(workoutId: string, userId: string): Promise<void> {
  //   await this.userService.getById(userId);

  //   const workoutToDelete = await this.getById(workoutId, userId);

  //   try {
  //     await this.workoutRepo.delete(workoutToDelete);
  //   } catch (e) {
  //     throw new CouldNotDeleteWorkoutException();
  //   }
  // }
}

import { Injectable } from '@nestjs/common';
import { LoggerService } from 'src/common/logger/logger.service';
import { ExerciseVariationService } from 'src/modules/exercises/services';
import { ExerciseService } from 'src/modules/exercises/services/exercise.service';
import { XpCannotBeBelowZeroException } from 'src/modules/user/internal-exceptions/xp-cannot-be-below-zero.exceptions';
import { UserStats } from 'src/modules/user/models/user-stats.model';
import { UserService } from 'src/modules/user/service/user.service';
import { LevelCalculator } from '../calculator';
import { DeleteWorkout } from '../interfaces/delete-workout.interface';
import { CouldNotDeleteWorkoutException } from '../internal-errors/could-not-delete-workout.exception';
import { InsertWorkoutModel, WorkoutModel } from '../models';
import { WorkoutRepository } from '../repository/workout.repository';
import { BaseWorkoutService } from './base-workout.service';
import { GetWorkoutService } from './get-workout.service';

@Injectable()
export class WorkoutService extends BaseWorkoutService {
  constructor(
    exerciseService: ExerciseService,
    exerciseVariationService: ExerciseVariationService,
    private workoutRepo: WorkoutRepository,
    private getWorkoutService: GetWorkoutService,
    private readonly userService: UserService,
    private readonly levelCalculator: LevelCalculator,
    private readonly logger: LoggerService,
  ) {
    super(exerciseService, exerciseVariationService);
    this.logger.setContext(WorkoutService.name);
  }

  /**
   * Finds all workouts for a user.
   * @param {string} userId
   * @returns {WorkoutModel[]}
   */
  public async findAll(userId: string): Promise<WorkoutModel[]> {
    return this.workoutRepo.findAll(userId);
  }

  /**
   * Deletes a workout.
   *
   * @param {string} workoutId
   * @param {string} userId
   *
   * @throws {CouldNotDeleteWorkoutException}
   * @throws {WorkoutNotFoundException}
   * @throws {XpCannotBeBelowZeroException}
   */
  public async delete(
    workoutId: string,
    userId: string,
  ): Promise<DeleteWorkout> {
    const workoutToBeDeleted = await this.getWorkoutService.getWorkoutDetails(
      workoutId,
      userId,
    );
    const userStats = await this.userService.getStatsByUserId(userId);

    if (userStats.totalXp - workoutToBeDeleted.gainedXp < 0) {
      throw new XpCannotBeBelowZeroException();
    }

    const { newLevel, newCurrentXp } =
      this.levelCalculator.calculateNewLevelAndCurrentXp(
        userStats.level,
        userStats.currentXp,
        -workoutToBeDeleted.gainedXp,
      );

    try {
      await this.workoutRepo.delete(workoutId, userId);

      const newUserStats = new UserStats();
      newUserStats.totalXp = userStats.totalXp - workoutToBeDeleted.gainedXp;
      newUserStats.level = newLevel;
      newUserStats.currentXp = newCurrentXp;
      const updatedUserStats = await this.userService.updateUserStats(
        userId,
        newUserStats,
      );
      return {
        totalUserXp: updatedUserStats.totalXp,
      };
    } catch (e) {
      throw new CouldNotDeleteWorkoutException(e.message);
    }
  }

  public async update(
    workoutId: string,
    userId: string,
    workout: InsertWorkoutModel,
  ): Promise<WorkoutModel> {
    await this.getWorkoutService.getWorkoutDetails(workoutId, userId);
    await this.validateExercisesExist(workout.exercises, userId);
    this.validateOrderForExercisesAndSets(workout);

    await this.workoutRepo.update(workoutId, workout, userId);
    return await this.getWorkoutService.getWorkoutDetails(workoutId, userId);
  }
}

import { Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from 'src/common/internal-exceptions';
import { LoggerService } from 'src/common/logger/logger.service';
import { WorkoutModel, WorkoutSummaryModel } from '../models';
import { GetWorkoutRepository } from '../repository';

@Injectable()
export class GetWorkoutService {
  constructor(
    private readonly getWorkoutRepo: GetWorkoutRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(GetWorkoutService.name);
  }

  public async getWorkoutSummaries(
    userId: string,
  ): Promise<WorkoutSummaryModel[]> {
    const startTime = Date.now();

    const workoutSummariesWithoutSetCount =
      await this.getWorkoutRepo.getWorkoutSummariesWithoutSetCount(userId);
    const workoutIds = workoutSummariesWithoutSetCount.map((w) => w.id);

    const setCount = await this.getWorkoutRepo.getNumberOfSetsForExercises(
      workoutIds,
      userId,
    );

    const workoutSummariesWithSetCount = workoutSummariesWithoutSetCount.map(
      (workoutSummary) => ({
        ...workoutSummary,
        exercises: workoutSummary.exercises.map((exercise) => ({
          ...exercise,
          numberOfSets:
            setCount.find(
              (s) => s.workoutExerciseId === exercise.workoutExerciseId,
            )?.numberOfSets ?? 0,
        })),
      }),
    );

    const endTime = Date.now();
    const elapsedTime = endTime - startTime;
    this.logger.log(`getWorkoutSummaries took ${elapsedTime} ms`, {
      elapsedTime,
    });

    return workoutSummariesWithSetCount;
  }

  public async getWorkoutDetails(
    workoutId: string,
    userId: string,
  ): Promise<WorkoutModel> {
    const workout = await this.getWorkoutRepo.getWorkoutById(workoutId, userId);
    if (!workout) {
      throw new ResourceNotFoundException('Workout not found');
    }

    const exercises =
      await this.getWorkoutRepo.getExercisesForWorkout(workoutId);

    workout.exercises = exercises;
    return workout;
  }
}

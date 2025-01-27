import { Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from 'src/common/internal-exceptions';
import { WorkoutModel, WorkoutSummaryModel } from '../models';
import { GetWorkoutRepository } from '../repository';

@Injectable()
export class GetWorkoutService {
  constructor(private readonly getWorkoutRepo: GetWorkoutRepository) {}

  public async getWorkoutSummaries(
    userId: string,
  ): Promise<WorkoutSummaryModel[]> {
    return this.getWorkoutRepo.getWorkoutSummaries(userId);
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

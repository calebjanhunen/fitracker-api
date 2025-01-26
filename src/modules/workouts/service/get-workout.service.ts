import { Injectable } from '@nestjs/common';
import { WorkoutSummaryModel } from '../models';
import { GetWorkoutRepository } from '../repository';

@Injectable()
export class GetWorkoutService {
  constructor(private readonly getWorkoutRepo: GetWorkoutRepository) {}

  public async getWorkoutSummaries(
    userId: string,
  ): Promise<WorkoutSummaryModel[]> {
    return this.getWorkoutRepo.getWorkoutSummaries(userId);
  }
}

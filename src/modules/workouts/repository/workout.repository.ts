import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Workout } from '../models/workout.entity';

@Injectable()
export class WorkoutRepository {
  constructor(
    @InjectRepository(Workout) private workoutRepo: Repository<Workout>,
    private dataSource: DataSource,
  ) {}

  public async saveWorkout(workout: Workout): Promise<Workout> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const createdWorkout = await queryRunner.manager.save(workout);
      await queryRunner.commitTransaction();
      return createdWorkout;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }
}

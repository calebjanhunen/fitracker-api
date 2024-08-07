import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CouldNotSaveWorkoutException } from '../internal-errors/could-not-save-workout.exception';
import { Workout } from '../models/workout.entity';

@Injectable()
export class WorkoutRepository {
  constructor(
    @InjectRepository(Workout) private workoutRepo: Repository<Workout>,
    private dataSource: DataSource,
  ) {}

  /**
   * Saves the workout entity to the database using a transaction
   * @param {Workout} workout
   * @returns {Workout} Saved Workout
   *
   * @throws {CouldNotSaveWorkoutException}
   */
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
      throw new CouldNotSaveWorkoutException(workout.name);
    } finally {
      await queryRunner.release();
    }
  }

  public async getSingle(id: string, userId: string): Promise<Workout | null> {
    const query = this.workoutRepo.createQueryBuilder('w');

    query
      .leftJoinAndSelect('w.workoutExercises', 'we')
      .leftJoin('we.exercise', 'e')
      .addSelect(['e.id', 'e.name'])
      .leftJoin('we.sets', 's')
      .addSelect(['s.reps', 's.weight', 's.rpe', 's.setOrder'])
      .where('w.id = :workoutId', { workoutId: id })
      .orderBy('s.setOrder', 'ASC')
      .andWhere('w.user_id = :userId', { userId });

    const workout = await query.getOne();
    return workout;
  }

  public async getMany(userId: string): Promise<Workout[]> {
    const query = this.workoutRepo.createQueryBuilder('w');

    query
      .leftJoinAndSelect('w.workoutExercises', 'we')
      .leftJoin('we.exercise', 'e')
      .addSelect(['e.id', 'e.name'])
      .leftJoin('we.sets', 'set')
      .addSelect(['set.setOrder', 'set.reps', 'set.weight', 'set.rpe'])
      .where('w.user_id = :userId', { userId })
      .orderBy('w.created_at', 'DESC')
      .addOrderBy('set.setOrder', 'ASC')
      .getMany();

    const workouts = await query.getMany();
    return workouts;
  }

  public async delete(workout: Workout): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.remove(workout);
      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }
}

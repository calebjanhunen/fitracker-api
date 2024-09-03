import { Injectable } from '@nestjs/common';
import { DbService } from 'src/common/database/database.service';
import {
  InsertWorkoutModel,
  WorkoutExerciseModel,
  WorkoutModel,
  WorkoutSetModel,
} from '../models';

interface RawWorkoutQueryResult {
  workoutId: string;
  workoutName: string;
  exerciseId: string;
  exerciseName: string;
  exerciseOrder: number;
  setId: string;
  reps: number;
  weight: number;
  rpe: number;
  setOrder: number;
}

@Injectable()
export class WorkoutRepository {
  constructor(private readonly dbService: DbService) {}

  /**
   * Saves the workout entity to the database using a transaction
   * @param {Workout} workout
   * @returns {Workout} Saved Workout
   *
   * @throws {CouldNotSaveWorkoutException}
   */
  // public async create(
  //   workout: InsertWorkoutModel,
  //   userId: string,
  // ): Promise<WorkoutModel> {
  //   const client = await this.dbService.connect();

  //   try {
  //     await this.dbService.startTransaction();
  //     // insert workout
  //     const query = `
  //       INSERT INTO workout (name, user_id)
  //       VALUES ($1, $2)
  //     `;
  //     const params = [workout.name, userId];
  //     await client.query(query, params);

  //     // insert workout exercises

  //     //insert sets
  //     await this.dbService.commitTransaction('CreateWorkout');
  //   } catch (e) {
  //     await this.dbService.rollbackTransaction('CreateWorkout', e);
  //   } finally {
  //     this.dbService.releaseClient();
  //   }
  // }

  public async findById(
    workoutId: string,
    userId: string,
  ): Promise<WorkoutModel | null> {
    const query = `
      SELECT
        w.id as workout_id,
        w.name as workout_name,
        e.id as exercise_id,
        e.name as exercise_name,
        we.order as exercise_order,
	      ws.id as set_id,
	      ws.reps,
	      ws.weight,
	      ws.rpe,
        ws.order as set_order
      FROM
        workout as w
      INNER JOIN
	      workout_exercise as we ON we.workout_id = w.id
      INNER JOIN
	      exercise as e ON e.id = we.exercise_id
      INNER JOIN
	      workout_set as ws ON ws.workout_exercise_id = we.id
      WHERE w.user_id = $1 AND w.id = $2
      ORDER BY we.order, ws.order;
    `;
    const params = [userId, workoutId];

    const result = await this.dbService.queryV2<RawWorkoutQueryResult>(
      'GetWorkoutById',
      query,
      params,
    );

    if (result.length === 0) {
      return null;
    }
    return this.fromQueryToWorkoutModel(result);
  }

  private fromQueryToWorkoutModel(
    workoutQuery: RawWorkoutQueryResult[],
  ): WorkoutModel {
    return workoutQuery.reduce((acc, currRow) => {
      if (!acc.id) {
        const workout = new WorkoutModel();
        workout.name = currRow.workoutName;
        workout.id = currRow.workoutId;
        workout.exercises = [];
        acc = workout;
      }

      const exercise = acc.exercises.find((e) => e.id === currRow.exerciseId);
      if (!exercise) {
        const newExercise = new WorkoutExerciseModel();
        newExercise.id = currRow.exerciseId;
        newExercise.name = currRow.exerciseName;
        newExercise.order = currRow.exerciseOrder;
        newExercise.sets = [];
        const set = new WorkoutSetModel();
        set.id = currRow.setId;
        set.order = currRow.setOrder;
        set.reps = currRow.reps;
        set.weight = currRow.weight;
        set.rpe = currRow.rpe;
        newExercise.sets.push(set);
        acc.exercises.push(newExercise);
      } else {
        const newSet = new WorkoutSetModel();
        newSet.id = currRow.setId;
        newSet.order = currRow.setOrder;
        newSet.reps = currRow.reps;
        newSet.weight = currRow.weight;
        newSet.rpe = currRow.rpe;
        exercise.sets.push(newSet);
      }

      return acc;
    }, new WorkoutModel());
  }

  // public async getMany(userId: string): Promise<Workout[]> {
  //   const query = this.workoutRepo.createQueryBuilder('w');

  //   query
  //     .leftJoinAndSelect('w.workoutExercises', 'we')
  //     .leftJoin('we.exercise', 'e')
  //     .addSelect(['e.id', 'e.name'])
  //     .leftJoin('we.sets', 'set')
  //     .addSelect(['set.setOrder', 'set.reps', 'set.weight', 'set.rpe'])
  //     .where('w.user_id = :userId', { userId })
  //     .orderBy('w.created_at', 'DESC')
  //     .addOrderBy('set.setOrder', 'ASC')
  //     .getMany();

  //   const workouts = await query.getMany();
  //   return workouts;
  // }

  // public async delete(workout: Workout): Promise<void> {
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   try {
  //     await queryRunner.manager.remove(workout);
  //     await queryRunner.commitTransaction();
  //   } catch (e) {
  //     await queryRunner.rollbackTransaction();
  //     throw e;
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }
}

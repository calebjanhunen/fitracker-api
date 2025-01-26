import { Injectable } from '@nestjs/common';
import { DbClient, DbService } from 'src/common/database';
import { LoggerService } from 'src/common/logger/logger.service';
import { InsertWorkoutModel } from '../models';
import { BaseWorkoutRepository } from './base-workout.repository';

@Injectable()
export class CreateWorkoutRepository extends BaseWorkoutRepository {
  constructor(
    private readonly db: DbService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(CreateWorkoutRepository.name);
  }

  public async createWorkout(
    workout: InsertWorkoutModel,
    userId: string,
  ): Promise<string> {
    const queryName = 'CreateWorkout';
    try {
      const { queryResult } = await this.db.transaction<string>(
        async (client) => {
          const insertedWorkoutId = await this.insertWorkout(
            client,
            workout,
            userId,
          );

          for (const exercise of workout.exercises) {
            const workoutExerciseId = await this.insertWorkoutExercise(
              client,
              insertedWorkoutId,
              exercise,
            );
            await this.insertExerciseSets(
              client,
              workoutExerciseId,
              exercise.sets,
            );
          }

          return insertedWorkoutId;
        },
      );

      return queryResult[0];
    } catch (e) {
      this.logger.error(e, `Query ${queryName} failed: `);
      throw e;
    }
  }

  /**
   * Inserts a Workout.
   * @param {DbClient} client Database client connection used for transactions
   * @param {InsertWorkoutModel} workout
   * @param {string} userId
   * @returns {string} Id of the inserted workout.
   */
  private async insertWorkout(
    client: DbClient,
    workout: InsertWorkoutModel,
    userId: string,
  ): Promise<string> {
    const query = `
            INSERT INTO workout (name, user_id, created_at, updated_at, duration, gained_xp)
            VALUES ($1, $2, $3, $3, $4, $5)
            RETURNING id;
          `;
    const params = [
      workout.name,
      userId,
      workout.createdAt,
      workout.duration,
      workout.gainedXp,
    ];
    const result = await client.query<{ id: string }>(query, params);

    return result.rows[0].id;
  }
}

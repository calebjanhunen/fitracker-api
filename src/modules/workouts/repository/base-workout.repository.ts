import { DbClient } from 'src/common/database';
import { InsertWorkoutExerciseModel, InsertWorkoutSetModel } from '../models';

export abstract class BaseWorkoutRepository {
  private readonly NUM_SET_VALUES = 5;
  constructor() {}

  /**
   * Inserts a workout exercise
   * @param {DbClient} client Database client connection used for transactions
   * @param {string} workoutId
   * @param {InsertWorkoutExerciseModel} exercise
   * @returns {string} Id of the workout exercise that was inserted.
   */
  protected async insertWorkoutExercise(
    client: DbClient,
    workoutId: string,
    exercise: InsertWorkoutExerciseModel,
  ): Promise<string> {
    let query;
    if (exercise.isVariation) {
      query = `
        INSERT INTO workout_exercise (workout_id, exercise_variation_id, "order")
        VALUES ($1, $2, $3)
        RETURNING id;
      `;
    } else {
      query = `
        INSERT INTO workout_exercise (workout_id, exercise_id, "order")
        VALUES ($1, $2, $3)
        RETURNING id;
      `;
    }
    const workoutExerciseInsertParams = [
      workoutId,
      exercise.exerciseId,
      exercise.order,
    ];
    const insertWorkoutExerciseResult = await client.query<{ id: string }>(
      query,
      workoutExerciseInsertParams,
    );
    return insertWorkoutExerciseResult.rows[0].id;
  }

  /**
   * Batch inserts the sets for an individual workout exercise.
   * @param {DbClient} client Database client connection used for transactions
   * @param {string} workoutExerciseId
   * @param {InsertWorkoutSetModel[]} sets
   */
  protected async insertExerciseSets(
    client: DbClient,
    workoutExerciseId: string,
    sets: InsertWorkoutSetModel[],
  ): Promise<void> {
    // Create the values placeholder for each set in the exercise
    const valuesPlaceHolder = sets.map(
      (_, index) => `
          ($${index * this.NUM_SET_VALUES + 1}, $${
            index * this.NUM_SET_VALUES + 2
          }, $${index * this.NUM_SET_VALUES + 3}, $${
            index * this.NUM_SET_VALUES + 4
          }, $${index * this.NUM_SET_VALUES + 5})
        `,
    );

    const query = `
          INSERT INTO workout_set ("order", weight, reps, rpe, workout_exercise_id)
          VALUES ${valuesPlaceHolder}
        `;

    // Create a flat array of each set value
    const params = sets.flatMap((set) => [
      set.order,
      set.weight,
      set.reps,
      set.rpe,
      workoutExerciseId,
    ]);
    await client.query(query, params);
  }
}

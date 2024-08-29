import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DbService } from 'src/common/database/database.service';
import { Exercise } from 'src/modules/exercises/models/exercise.entity';
import { User } from 'src/modules/user/models/user.entity';
import { WorkoutExercise } from 'src/modules/workouts/models/workout-exercises.entity';
import { Repository } from 'typeorm';
import { ExerciseUsage } from '../interfaces/exercise-usage.interface';
import { ExerciseModel } from '../models/exerise.model';
import { InsertExerciseModel } from '../models/insert-exercise.model';

@Injectable()
export class ExerciseRepository {
  constructor(private readonly db: DbService) {}

  /**
   * Creates a new exercise.
   * @param {InsertExerciseModel} exercise
   * @returns {ExerciseModel}
   */
  public async create(exercise: InsertExerciseModel): Promise<ExerciseModel> {
    const query = `
        INSERT INTO exercise (name, body_part_id, equipment_id, is_custom, user_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;
    const values = [
      exercise.name,
      exercise.bodyPartId,
      exercise.equipmentId,
      exercise.isCustom,
      exercise.userId,
    ];

    const result = await this.db.query<ExerciseModel>(
      'CreateExercise',
      query,
      values,
    );
    return ExerciseModel.fromDbQuery(result.rows[0]);
  }

  // /**
  //  * This function retrieves exercises based on specified options such as fields, pagination, and user
  //  * ID.
  //  * @param {string} userId   ID of the user
  //  * @param options           Contains following properties: fields (Exercise fields),
  //  *                          take (number of exercises to retrieve), skip (number of exercises to skip)
  //  *
  //  * @returns {Exercise[]}    Array of exercises
  //  */
  // public async getAll(
  //   userId: string,
  //   options: {
  //     fields?: (keyof Exercise)[];
  //     take?: number;
  //     skip?: number;
  //   } = {},
  // ): Promise<Exercise[]> {
  //   const query = this.exerciseRepo.createQueryBuilder('exercise');

  //   // Add fields to query if present
  //   if (options.fields && options.fields.length > 0) {
  //     const selectQuery = options.fields.map((field) => `exercise.${field}`);
  //     query.select(selectQuery);
  //   }

  //   // add take and skip options to query if present (for pagination)
  //   if (options.take) query.take(options.take);
  //   if (options.skip) query.skip(options.skip);

  //   query.where('exercise.is_custom = false or exercise.user_id = :userId', {
  //     userId,
  //   });

  //   query.orderBy('exercise.name', 'ASC');

  //   const result = await query.getMany();
  //   return result;
  // }

  // /**
  //  * Retrieves exercises by their IDs for a specific user, including both
  //  * custom and non-custom exercises.
  //  * @param {string[]} ids
  //  * @param {User} user
  //  * @returns {Exercise[]}
  //  */
  // public async getByIds(ids: string[], user: User): Promise<Exercise[]> {
  //   const qb = this.exerciseRepo.createQueryBuilder();

  //   qb.where('id IN(:...ids) AND user_id = :userId', { ids, userId: user.id });
  //   qb.orWhere('id IN(:...ids) AND is_custom = false', { ids });
  //   return await qb.getMany();
  // }

  // /**
  //  * Gets an exercise by its id and user id if custom
  //  * @param {string} id
  //  * @param {string} userId
  //  * @returns {Exercise | null}
  //  */
  // public async getById(id: string, userId: string): Promise<Exercise | null> {
  //   const query = this.exerciseRepo.createQueryBuilder('e');

  //   query
  //     .leftJoin('e.user', 'user')
  //     .addSelect('user.id')
  //     .where('e.id = :id AND (e.user_id = :userId OR e.user_id IS NULL)', {
  //       id,
  //       userId,
  //     });

  //   const result = await query.getOne();
  //   return result;
  // }

  // /**
  //  * Retrieves number of times each exercise is used along with its id.
  //  * @param {string} userId
  //  * @returns {ExerciseUsage[]}
  //  */
  // public async getExerciseUsages(userId: string): Promise<ExerciseUsage[]> {
  //   const query = this.workoutExerciseRepo.createQueryBuilder('we');
  //   query
  //     .select('we.exercise_id', 'exercise_id')
  //     .addSelect('COUNT(we.exercise_id)', 'num_times_used')
  //     .groupBy('we.exercise_id')
  //     .innerJoin('workouts', 'w', 'w.id = we.workout_id')
  //     .where('w.user_id = :userId', { userId });
  //   const result = await query.getRawMany<{
  //     exercise_id: string;
  //     num_times_used: string;
  //   }>();

  //   return result;
  // }

  // /**
  //  * Retrieves the sets of an exercise from the most recent workout the exercise was used in.
  //  * @param {string} userId
  //  * @returns {WorkoutExercise[]}
  //  */
  // public async getRecentSetsForExercises(
  //   userId: string,
  //   exerciseIds?: string[],
  // ): Promise<WorkoutExercise[]> {
  //   const query = this.workoutExerciseRepo.createQueryBuilder('we');
  //   query
  //     .select([
  //       'w.id',
  //       'we.id',
  //       'e.id',
  //       'set.id',
  //       'set.weight',
  //       'set.reps',
  //       'set.rpe',
  //       'set.setOrder',
  //     ])
  //     .leftJoin('we.exercise', 'e')
  //     .leftJoin('we.workout', 'w')
  //     .leftJoin('we.sets', 'set')
  //     .where((qb) => {
  //       const subQ = qb
  //         .subQuery()
  //         .select('MAX(w2.created_at)')
  //         .from('workouts', 'w2')
  //         .leftJoin('w2.workoutExercises', 'we2')
  //         .where('we2.exercise_id = we.exercise_id')
  //         .getQuery();

  //       return 'w.created_at = ' + subQ;
  //     })
  //     .andWhere('w.user_id = :userId', { userId })
  //     .orderBy('we.exercise_id')
  //     .addOrderBy('w.created_at')
  //     .addOrderBy('set.set_order');

  //   if (exerciseIds && exerciseIds.length > 0) {
  //     query.andWhere('e.id IN (:...exerciseIds)', { exerciseIds });
  //   }
  //   const result = await query.getMany();
  //   return result;
  // }

  // /**
  //  * Updates an existing exercise.
  //  * @param {Exercise} exercise
  //  * @returns {Exercise}
  //  */
  // public async update(exercise: Exercise): Promise<Exercise> {
  //   return await this.exerciseRepo.save(exercise);
  // }

  // /**
  //  * Deletes an existing exercise.
  //  * @param {Exercise} exercise
  //  */
  // public async delete(exercise: Exercise): Promise<void> {
  //   await this.exerciseRepo.remove(exercise);
  // }
}

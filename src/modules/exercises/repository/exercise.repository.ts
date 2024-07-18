import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Exercise } from 'src/model';
import { WorkoutExercise } from 'src/modules/workouts/models/workout-exercises.entity';
import { Repository } from 'typeorm';
import { ExerciseUsage } from '../interfaces/exercise-usage.interface';

@Injectable()
export class ExerciseRepository {
  constructor(
    @InjectRepository(Exercise) private exerciseRepo: Repository<Exercise>,
    @InjectRepository(WorkoutExercise)
    private workoutExerciseRepo: Repository<WorkoutExercise>,
  ) {}

  public async getAll(
    userId: string,
    fields?: (keyof Exercise)[],
  ): Promise<Exercise[]> {
    const query = this.exerciseRepo.createQueryBuilder('exercise');

    if (fields && fields.length > 0) {
      const selectQuery = fields.map((field) => `exercise.${field}`);
      query.select(selectQuery);
    }

    query.where('exercise.is_custom = false or exercise.user_id = :userId', {
      userId,
    });

    query.orderBy('exercise.name', 'ASC');

    const result = await query.getMany();
    return result;
  }

  public async getExerciseUsages(userId: string): Promise<ExerciseUsage[]> {
    const query = this.workoutExerciseRepo.createQueryBuilder('we');
    query
      .select('we.exercise_id', 'exercise_id')
      .addSelect('COUNT(we.exercise_id)', 'num_times_used')
      .groupBy('we.exercise_id')
      .innerJoin('workouts', 'w', 'w.id = we.workout_id')
      .where('w.user_id = :userId', { userId });
    const result = await query.getRawMany<{
      exercise_id: string;
      num_times_used: string;
    }>();

    return result;
  }

  public async getRecentSetsForExercises(
    userId: string,
  ): Promise<WorkoutExercise[]> {
    const query = this.workoutExerciseRepo.createQueryBuilder('we');
    query
      .select([
        'w.id',
        'we.id',
        'e.id',
        'set.id',
        'set.weight',
        'set.reps',
        'set.rpe',
        'set.setOrder',
      ])
      .leftJoin('we.exercise', 'e')
      .leftJoin('we.workout', 'w')
      .leftJoin('we.sets', 'set')
      .where((qb) => {
        const subQ = qb
          .subQuery()
          .select('MAX(w2.created_at)')
          .from('workouts', 'w2')
          .leftJoin('w2.workoutExercises', 'we2')
          .where('we2.exercise_id = we.exercise_id')
          .getQuery();

        return 'w.created_at = ' + subQ;
      })
      .andWhere('w.user_id = :userId', { userId })
      .orderBy('we.exercise_id')
      .addOrderBy('w.created_at')
      .addOrderBy('set.set_order');
    const result = await query.getMany();
    return result;
  }
}

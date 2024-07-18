import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExerciseForWorkout } from 'src/modules/exercises/interfaces/exercise-for-workout.interface';
import ExercisesService from 'src/modules/exercises/services/exercises.service';
import { UserService } from 'src/modules/user/service/user.service';
import { CreateWorkoutRequestDTO } from 'src/modules/workouts/dtos/create-workout-request.dto';
import { WorkoutExercise } from 'src/modules/workouts/models/workout-exercises.entity';
import { DataSource, Repository } from 'typeorm';
import { CouldNotDeleteWorkoutException } from '../internal-errors/could-not-delete-workout.exception';
import { WorkoutNotFoundException } from '../internal-errors/workout-not-found.exception';
import { WorkoutMapper } from '../mappers/workout-mapper';
import { Workout } from '../models/workout.entity';
import { WorkoutRepository } from '../repository/workout.repository';

@Injectable()
export class WorkoutsService {
  constructor(
    @InjectRepository(Workout) private workoutRepo: Repository<Workout>,
    @InjectRepository(WorkoutExercise)
    private workoutExerciseRepo: Repository<WorkoutExercise>,
    private exercisesService: ExercisesService,
    private userService: UserService,
    private dataSource: DataSource,
    private customWorkoutRepo: WorkoutRepository,
  ) {}

  /**
   * Validates exercises exist, maps workout dto to entity
   * and saves the workout
   * @param {CreateWorkoutRequestDTO} workoutDto
   * @param {string} userId
   * @returns {WorkoutResponseDto} Created Workout
   *
   * @throws {EntityNotFoundError}
   * @throws {CouldNotSaveWorkoutException}
   */
  async createWorkout(
    workoutDto: CreateWorkoutRequestDTO,
    userId: string,
  ): Promise<Workout> {
    const user = await this.userService.getById(userId);

    // Get existing exercises from db using ids in workout dto
    const exerciseIds = workoutDto.exercises.map((e) => e.id);
    const foundExercises = await this.exercisesService.getExercisesByIds(
      exerciseIds,
      user,
    );

    // assert all exercises in dto exist in db
    if (foundExercises.length !== exerciseIds.length)
      throw new Error('One or more exercises do not exist');

    const workoutEntity = WorkoutMapper.fromDtoToEntity(
      workoutDto,
      foundExercises,
      user,
    );

    const createdWorkout =
      await this.customWorkoutRepo.saveWorkout(workoutEntity);

    return createdWorkout;
  }

  /**
   * Gets a workout by its id.
   * @param {string} workoutId The id of the workout.
   * @param {string} userId    The id of the user.
   * @return {Workout}
   *
   * @throws {WorkoutNotFoundException}
   */
  async getById(workoutId: string, userId: string): Promise<Workout> {
    await this.userService.getById(userId);

    const workout = await this.customWorkoutRepo.getSingle(workoutId, userId);

    if (!workout) throw new WorkoutNotFoundException();

    return workout;
  }

  /**
   * Gets all workouts for a given user
   * @param {string} userId
   * @returns {Workout[]}
   */
  async getWorkouts(userId: string): Promise<Workout[]> {
    await this.userService.getById(userId);

    const workouts = await this.customWorkoutRepo.getMany(userId);

    return workouts;
  }

  /**
   * Deletes a workout given its id
   *
   * @param {string} workoutId
   * @param {string} userId
   *
   * @throws {CouldNotDeleteWorkoutException}
   * @throws {WorkoutNotFoundException}
   */
  async deleteWorkout(workoutId: string, userId: string): Promise<void> {
    await this.userService.getById(userId);

    const workoutToDelete = await this.getById(workoutId, userId);

    try {
      await this.customWorkoutRepo.delete(workoutToDelete);
    } catch (e) {
      throw new CouldNotDeleteWorkoutException();
    }
  }

  /**
   * Retrieves exercises for a workout based on a user ID.
   * @param {string} userId - String representing the id of the user.
   * @returns {ExerciseForWorkout[]} Array of Exercise objects with the properties 'id', 'name', 'primaryMuscle' and 'numTimesUsed'.
   */
  public async getExercisesForWorkout(
    userId: string,
  ): Promise<ExerciseForWorkout[]> {
    // find all exercises
    const exercises = await this.exercisesService.findAllExercises(userId, [
      'id',
      'name',
      'primaryMuscle',
    ]);

    // Get number of times each exercise was used in a workout for the user
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

    // Get sets from most recent workout for each exercise
    const previousSetsQuery = this.workoutExerciseRepo.createQueryBuilder('we');
    previousSetsQuery
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
          .leftJoin('w2.workoutExercise', 'we2')
          .where('we2.exercise_id = we.exercise_id')
          .getQuery();

        return 'w.created_at = ' + subQ;
      })
      .andWhere('w.user_id = :userId', { userId })
      .orderBy('we.exercise_id')
      .addOrderBy('w.created_at')
      .addOrderBy('set.set_order');
    const prevSetsRes = await previousSetsQuery.getMany();

    // Combine all 3 queries into one array of exercises
    const numTimesUsedMap = new Map(
      result.map((res) => [res.exercise_id, res.num_times_used]),
    );
    const exercisesForWorkout: ExerciseForWorkout[] = exercises.map((e) => {
      const prevSets = prevSetsRes.find((prev) => prev.exercise.id === e.id);
      return {
        ...e,
        numTimesUsed: numTimesUsedMap.get(e.id) || '0',
        previousSets: prevSets?.sets || [],
      };
    });

    return exercisesForWorkout;
  }
}

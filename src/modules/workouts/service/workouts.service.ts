import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExerciseForWorkout } from 'src/modules/exercises/interfaces/exercise-for-workout.interface';
import ExercisesService from 'src/modules/exercises/services/exercises.service';
import { UserService } from 'src/modules/user/service/user.service';
import { CreateWorkoutRequestDTO } from 'src/modules/workouts/dtos/create-workout-request.dto';
import { WorkoutExercise } from 'src/modules/workouts/models/workout-exercises.entity';
import { DataSource, Repository } from 'typeorm';
import { WorkoutResponseDto } from '../dtos/workout-response.dto';
import { CouldNotDeleteWorkoutException } from '../internal-errors/could-not-delete-workout.exception';
import { WorkoutNotFoundException } from '../internal-errors/workout-not-found.exception';
import { WorkoutMapper } from '../mappers/workout-mapper';
import { Set } from '../models/set.entity';
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
  ): Promise<WorkoutResponseDto> {
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

    return WorkoutMapper.fromEntityToDto(createdWorkout);
  }

  /**
   * Gets a workout by its id.
   * @param {string} workoutId The id of the workout.
   * @param {string} userId    The id of the user.
   * @return {Workout}
   *
   * @throws {WorkoutNotFoundException}
   */
  async getById(
    workoutId: string,
    userId: string,
  ): Promise<WorkoutResponseDto> {
    await this.userService.getById(userId);

    const workout = await this.workoutRepo.findOne({
      where: { id: workoutId, user: { id: userId } },
      relations: [
        'workoutExercise',
        'workoutExercise.exercise',
        'workoutExercise.sets',
      ],
    });

    if (!workout) {
      throw new WorkoutNotFoundException();
    }

    return WorkoutMapper.fromEntityToDto(workout);
  }

  /**
   * Gets all workouts for a given user
   * @param {string} userId
   * @returns {Workout[]}
   */
  async getWorkouts(userId: string): Promise<WorkoutResponseDto[]> {
    await this.userService.getById(userId);
    const query = this.workoutRepo.createQueryBuilder('w');

    query
      .leftJoinAndSelect('w.workoutExercise', 'we')
      .leftJoin('we.exercise', 'e')
      .addSelect(['e.id', 'e.name'])
      .leftJoin('we.sets', 'set')
      .addSelect(['set.setOrder', 'set.reps', 'set.weight', 'set.rpe'])
      .where('w.user_id = :userId', { userId })
      .orderBy('w.created_at', 'DESC')
      .addOrderBy('set.setOrder', 'ASC')
      .getMany();

    const workoutsV2 = await query.getMany();

    return workoutsV2.map((workout) => WorkoutMapper.fromEntityToDto(workout));
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

  /**
   * Deletes a workout given its id
   *
   * @param {string} workoutId
   * @param {string} userId
   *
   * @throws {CouldNotDeleteWorkoutException}
   * @throws {WorkoutNotFoundException}
   */
  async deleteById(workoutId: string, userId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    // throws WorkoutNotFoundException if workout does not exist
    await this.getById(workoutId, userId);

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const workoutExercises = await queryRunner.manager.find(WorkoutExercise, {
        where: { workout: { id: workoutId } },
      });
      for (const workoutExercise of workoutExercises) {
        await queryRunner.manager.delete(Set, {
          workoutExercise: { id: workoutExercise.id },
        });
      }

      await queryRunner.manager.delete(WorkoutExercise, {
        workout: { id: workoutId },
      });

      await queryRunner.manager.delete(Workout, { id: workoutId });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new CouldNotDeleteWorkoutException();
    } finally {
      await queryRunner.release();
    }
  }
}

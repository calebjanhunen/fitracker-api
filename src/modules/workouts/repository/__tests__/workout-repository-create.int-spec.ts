import { DatabaseException } from 'src/common/internal-exceptions/database.exception';
import { InsertWorkoutModel } from '../../models';
import { WorkoutRepository } from '../workout.repository';

describe('WorkoutRepository: create', () => {
  const pool = global.getDbPool();
  let workoutRepo: WorkoutRepository;
  const userId = 'ca0f33a8-5c91-4056-9afd-a0783c624e92';
  let exercise1Id: string;
  let exercise2Id: string;

  beforeAll(async () => {
    workoutRepo = new WorkoutRepository(global.dbService);

    await pool.query(`
      INSERT INTO "user" (id, username, password, first_name, last_name, email)
      VALUES 
        ('${userId}', 'test_user1', 'password1', 'Test', 'User1', 'test1@example.com')
    `);
    const result = await pool.query(
      `SELECT id FROM exercise WHERE name = 'Deadlift'`,
    );
    exercise1Id = result.rows[0].id;
    const result2 = await pool.query(
      `SELECT id FROM exercise WHERE name = 'Bench Press'`,
    );
    exercise2Id = result2.rows[0].id;
  });

  afterEach(async () => {
    await pool.query('TRUNCATE TABLE workout RESTART IDENTITY CASCADE;');
  });

  afterAll(async () => {
    await pool.query('TRUNCATE TABLE "user" RESTART IDENTITY CASCADE;');
  });

  it('should successfully return a workout', async () => {
    const model = new InsertWorkoutModel();
    model.name = 'Test Insert Workout';
    model.exercises = [
      {
        exerciseId: exercise1Id,
        order: 1,
        sets: [
          { order: 1, weight: 200, reps: 20, rpe: 9 },
          { order: 2, weight: 200, reps: 15, rpe: 10 },
        ],
      },
      {
        exerciseId: exercise2Id,
        order: 2,
        sets: [
          { order: 1, weight: 400, reps: 10, rpe: 9 },
          { order: 2, weight: 400, reps: 9, rpe: 10 },
          { order: 3, weight: 400, reps: 8, rpe: 10 },
        ],
      },
    ];

    const result = await workoutRepo.create(model, userId);
    const workoutResult = await pool.query(
      'SELECT * FROM workout WHERE id = $1',
      [result.id],
    );
    expect(workoutResult.rows.length).toBe(1);
    expect(workoutResult.rows[0].name).toBe('Test Insert Workout');

    const exercisesResult = await pool.query(
      'SELECT * FROM workout_exercise WHERE workout_id = $1',
      [result.id],
    );
    expect(exercisesResult.rows.length).toBe(2);

    const exerciseOne = exercisesResult.rows.find(
      (e) => e.exercise_id === exercise1Id,
    )!;
    const set1Result = await pool.query(
      'SELECT * FROM workout_set WHERE workout_exercise_id = $1',
      [exerciseOne.id],
    );
    expect(set1Result.rows.length).toBe(2);

    const exerciseTwo = exercisesResult.rows.find(
      (e) => e.exercise_id === exercise2Id,
    )!;
    const set2Result = await pool.query(
      'SELECT * FROM workout_set WHERE workout_exercise_id = $1',
      [exerciseTwo.id],
    );
    expect(set2Result.rows.length).toBe(3);
  });
  it('should rollback transaction if error occurs during workout creation', async () => {
    const model = new InsertWorkoutModel();
    model.name = 'Test Insert Workout';
    model.exercises = [
      {
        exerciseId: exercise1Id,
        order: 1,
        sets: [
          { order: 1, weight: 200, reps: 20, rpe: 9 },
          { order: 2, weight: 200, reps: 15, rpe: 10 },
        ],
      },
      {
        exerciseId: '5ad00fef-2997-4f42-8ebf-95ce3e0dbed9', //this exercise does not exist
        order: 2,
        sets: [
          { order: 1, weight: 400, reps: 10, rpe: 9 },
          { order: 2, weight: 400, reps: 9, rpe: 10 },
          { order: 3, weight: 400, reps: 8, rpe: 10 },
        ],
      },
    ];

    await expect(workoutRepo.create(model, userId)).rejects.toThrow(
      new DatabaseException(
        'insert or update on table "workout_exercise" violates foreign key constraint "fk_exercise_workout_exercise"',
      ),
    );

    const workoutResult = await pool.query(
      'SELECT * FROM workout WHERE name = $1',
      ['Test Insert Workout'],
    );
    expect(workoutResult.rows.length).toBe(0);

    const exercisesResult = await pool.query(
      'SELECT * FROM workout WHERE id = $1',
      [exercise1Id],
    );
    expect(exercisesResult.rows.length).toBe(0);

    const setResults = await pool.query('SELECT * FROM workout_set');
    expect(setResults.rows.length).toBe(0);
  });
});

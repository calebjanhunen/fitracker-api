import { LoggerServiceV2 } from 'src/common/logger/logger-v2.service';
import { InsertWorkoutModel } from '../../models';
import { WorkoutRepository } from '../workout.repository';

describe('WorkoutRepository: update', () => {
  const pool = global.getDbPool();
  let workoutRepo: WorkoutRepository;
  const workoutId = 'a90bf798-8f67-4cbb-ae86-62be0cb4aee0';
  const userId = 'ca0f33a8-5c91-4056-9afd-a0783c624e92';
  beforeAll(async () => {
    const logger = new LoggerServiceV2();
    workoutRepo = new WorkoutRepository(global.dbService, logger);
  });

  beforeEach(async () => {
    await pool.query(`
        INSERT INTO "user" (id, username, password, first_name, last_name, email)
        VALUES 
          ('${userId}', 'test_user1', 'password1', 'Test', 'User1', 'test1@example.com')
      `);
    await pool.query(`
        INSERT INTO exercise (id, name, body_part_id, equipment_id)
        VALUES ('5f918339-46ac-4128-ac7f-16eb4a7c8d6f', 'Test Exercise 1', 1, 1)
      `);
    await pool.query(`
        INSERT INTO exercise (id, name, body_part_id, equipment_id)
        VALUES ('3ddb278c-508f-4131-9427-9b42863263f6', 'Test Exercise 2', 2, 2)
      `);
    await pool.query(`
        INSERT INTO workout (id, name, user_id)
        VALUES ('${workoutId}', 'Test Workout', '${userId}');  
    `);

    // For Test Exercise 1
    await pool.query(`
        INSERT INTO workout_exercise (id, "order", workout_id, exercise_id)
        VALUES ('53b446ab-71ea-4db5-bfaa-5fb20e20634e', 1, '${workoutId}', '5f918339-46ac-4128-ac7f-16eb4a7c8d6f');  
    `);
    await pool.query(`
       INSERT INTO workout_set (reps, weight, rpe, workout_exercise_id, "order")
       VALUES (15, 100, 10, '53b446ab-71ea-4db5-bfaa-5fb20e20634e', 1) 
    `);
    await pool.query(`
       INSERT INTO workout_set (reps, weight, rpe, workout_exercise_id, "order")
       VALUES (14, 100, 10, '53b446ab-71ea-4db5-bfaa-5fb20e20634e', 2) 
    `);
    await pool.query(`
       INSERT INTO workout_set (reps, weight, rpe, workout_exercise_id, "order")
       VALUES (13, 100, 10, '53b446ab-71ea-4db5-bfaa-5fb20e20634e', 3) 
    `);

    // For Test Exercise 2
    await pool.query(`
        INSERT INTO workout_exercise (id, "order", workout_id, exercise_id)
        VALUES ('d922e161-d5ca-47b3-bfe5-296a82073068', 2, '${workoutId}', '3ddb278c-508f-4131-9427-9b42863263f6');  
    `);
    await pool.query(`
       INSERT INTO workout_set (reps, weight, rpe, workout_exercise_id, "order")
       VALUES (20, 100, 10, 'd922e161-d5ca-47b3-bfe5-296a82073068', 1) 
    `);
    await pool.query(`
       INSERT INTO workout_set (reps, weight, rpe, workout_exercise_id, "order")
       VALUES (19, 100, 10, 'd922e161-d5ca-47b3-bfe5-296a82073068', 2) 
    `);
    await pool.query(`
       INSERT INTO workout_set (reps, weight, rpe, workout_exercise_id, "order")
       VALUES (18, 100, 10, 'd922e161-d5ca-47b3-bfe5-296a82073068', 3) 
    `);
  });

  afterEach(async () => {
    await pool.query('TRUNCATE TABLE workout_set;');
    await pool.query('TRUNCATE TABLE workout_exercise CASCADE;');
    await pool.query('TRUNCATE TABLE workout CASCADE;');
    await pool.query(
      "DELETE FROM exercise WHERE name LIKE '%Test Exercise%' ;",
    );
    await pool.query('DELETE FROM "user" WHERE username = \'test_user1\'');
  });

  it('should successfully update workout name', async () => {
    const updatedModel = new InsertWorkoutModel();
    updatedModel.name = 'Test Workout Updated';
    updatedModel.exercises = [
      {
        exerciseId: '5f918339-46ac-4128-ac7f-16eb4a7c8d6f',
        order: 1,
        sets: [
          { reps: 15, weight: 100, rpe: 10, order: 1 },
          { reps: 14, weight: 100, rpe: 10, order: 2 },
          { reps: 13, weight: 100, rpe: 10, order: 3 },
        ],
      },
      {
        exerciseId: '3ddb278c-508f-4131-9427-9b42863263f6',
        order: 2,
        sets: [
          { reps: 20, weight: 100, rpe: 10, order: 1 },
          { reps: 19, weight: 100, rpe: 10, order: 2 },
          { reps: 18, weight: 100, rpe: 10, order: 3 },
        ],
      },
    ];

    const updatedWorkout = await workoutRepo.update(
      workoutId,
      updatedModel,
      userId,
    );

    expect(updatedWorkout.name).toBe('Test Workout Updated');
    expect(updatedWorkout.exercises.length).toBe(2);
    expect(updatedWorkout.exercises[0].name).toBe('Test Exercise 1');
    expect(updatedWorkout.exercises[0].sets.length).toBe(3);
    expect(updatedWorkout.exercises[1].name).toBe('Test Exercise 2');
    expect(updatedWorkout.exercises[1].sets.length).toBe(3);
  });
});

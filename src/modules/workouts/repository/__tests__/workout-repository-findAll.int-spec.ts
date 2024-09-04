import { WorkoutRepository } from '../workout.repository';

describe('WorkoutRepository: findAll', () => {
  const pool = global.getDbPool();
  let workoutRepo: WorkoutRepository;

  beforeAll(async () => {
    workoutRepo = new WorkoutRepository(global.dbService);
  });

  beforeEach(async () => {
    await pool.query(`
        INSERT INTO "user" (id, username, password, first_name, last_name, email)
        VALUES 
          ('ca0f33a8-5c91-4056-9afd-a0783c624e92', 'test_user1', 'password1', 'Test', 'User1', 'test1@example.com')
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
        VALUES ('a90bf798-8f67-4cbb-ae86-62be0cb4aee0', 'Test Workout', 'ca0f33a8-5c91-4056-9afd-a0783c624e92');  
    `);

    // For Test Exercise 1
    await pool.query(`
        INSERT INTO workout_exercise (id, "order", workout_id, exercise_id)
        VALUES ('53b446ab-71ea-4db5-bfaa-5fb20e20634e', 1, 'a90bf798-8f67-4cbb-ae86-62be0cb4aee0', '5f918339-46ac-4128-ac7f-16eb4a7c8d6f');  
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
        VALUES ('d922e161-d5ca-47b3-bfe5-296a82073068', 2, 'a90bf798-8f67-4cbb-ae86-62be0cb4aee0', '3ddb278c-508f-4131-9427-9b42863263f6');  
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
    await pool.query('TRUNCATE TABLE "user" RESTART IDENTITY CASCADE;');
    await pool.query('TRUNCATE TABLE workout_set RESTART IDENTITY CASCADE;');
    await pool.query(
      'TRUNCATE TABLE workout_exercise RESTART IDENTITY CASCADE;',
    );
    await pool.query('TRUNCATE TABLE workout RESTART IDENTITY CASCADE;');
    await pool.query('TRUNCATE TABLE exercise RESTART IDENTITY CASCADE;');
    await pool.query('TRUNCATE TABLE body_part RESTART IDENTITY CASCADE;');
    await pool.query('TRUNCATE TABLE equipment RESTART IDENTITY CASCADE;');
  });

  it('should successfully return an array of workouts', async () => {
    const result = await workoutRepo.findAll(
      'ca0f33a8-5c91-4056-9afd-a0783c624e92',
    );
    expect(result.length).toBe(1);
  });
});
import { MyLoggerService } from 'src/common/logger/logger.service';
import { WorkoutRepository } from '../workout.repository';

describe('WorkoutRepository: delete', () => {
  const pool = global.getDbPool();
  let workoutRepo: WorkoutRepository;

  beforeAll(async () => {
    const logger = new MyLoggerService(WorkoutRepository.name);
    workoutRepo = new WorkoutRepository(global.dbService, logger);
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
    await pool.query('TRUNCATE TABLE workout_set;');
    await pool.query('TRUNCATE TABLE workout_exercise CASCADE;');
    await pool.query('TRUNCATE TABLE workout CASCADE;');
    await pool.query(
      "DELETE FROM exercise WHERE name LIKE '%Test Exercise%' ;",
    );
    await pool.query('DELETE FROM "user" WHERE username = \'test_user1\'');
  });

  it('should successfully delete a workout and cascade delete workout exercises and workout sets', async () => {
    await workoutRepo.delete(
      'a90bf798-8f67-4cbb-ae86-62be0cb4aee0',
      'ca0f33a8-5c91-4056-9afd-a0783c624e92',
    );

    const workouts = await pool.query('SELECT * FROM workout');
    const exercises = await pool.query('SELECT * FROM workout_exercise');
    const sets = await pool.query('SELECT * FROM workout_set');

    expect(workouts.rows.length).toBe(0);
    expect(exercises.rows.length).toBe(0);
    expect(sets.rows.length).toBe(0);
  });
  it('should not delete the workout if a user deletes a workout that does not belong to them', async () => {
    await workoutRepo.delete(
      'a90bf798-8f67-4cbb-ae86-62be0cb4aee0',
      '3d8008d5-fe54-45e5-9808-feb2f36a50ce', // user does not own workout
    );

    const workouts = await pool.query('SELECT * FROM workout');
    const exercises = await pool.query('SELECT * FROM workout_exercise');
    const sets = await pool.query('SELECT * FROM workout_set');

    expect(workouts.rows.length).toBe(1);
    expect(exercises.rows.length).toBe(2);
    expect(sets.rows.length).toBe(6);
  });
});

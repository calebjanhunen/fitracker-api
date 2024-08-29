import { ExerciseModel } from '../../models/exerise.model';
import { InsertExerciseModel } from '../../models/insert-exercise.model';
import { ExerciseRepository } from '../exercise.repository';

describe('UserRepository: create()', () => {
  const pool = global.getDbPool();
  let exerciseRepo: ExerciseRepository;

  beforeAll(async () => {
    exerciseRepo = new ExerciseRepository(global.dbService);
  });

  beforeEach(async () => {
    await pool.query(`
        INSERT INTO "user" (id, username, password, first_name, last_name, email)
        VALUES ('3781951f-bec1-45db-b8c6-e772258d8ddb', 'user', '123', 'f', 'd', '1')
        RETURNING *;    
    `);
  });

  afterEach(async () => {
    await pool.query('TRUNCATE TABLE exercise RESTART IDENTITY CASCADE;');
  });

  it('should successfully create user', async () => {
    const model = new InsertExerciseModel(
      'Test Exercise',
      1,
      2,
      '3781951f-bec1-45db-b8c6-e772258d8ddb',
    );
    const result = await exerciseRepo.create(model);
    expect(result).toBeInstanceOf(ExerciseModel);
    expect(result.name).toBe('Test Exercise');
    expect(result.userId).toBe('3781951f-bec1-45db-b8c6-e772258d8ddb');
  });
});

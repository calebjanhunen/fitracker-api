import { ExerciseRepository } from '../exercise.repository';

describe('ExerciseRepository: findByIds', () => {
  const pool = global.getDbPool();
  let exerciseRepo: ExerciseRepository;

  beforeAll(async () => {
    exerciseRepo = new ExerciseRepository(global.dbService);
  });

  beforeEach(async () => {
    await pool.query(`
        INSERT INTO "user" (id, username, password, first_name, last_name, email)
        VALUES ('3781951f-bec1-45db-b8c6-e772258d8ddb', 'user', '123', 'f', 'd', '1')
    `);
    await pool.query(`
      INSERT INTO exercise (id, name, body_part_id, equipment_id, is_custom, user_id)
      VALUES ('3ddb278c-508f-4131-9427-9b42863263f6', 'Test Exercise 2', 2, 2, true, '3781951f-bec1-45db-b8c6-e772258d8ddb')
    `);
  });

  afterEach(async () => {
    await pool.query(
      "DELETE FROM exercise WHERE name LIKE '%Test Exercise%' ;",
    );
  });

  it('should successfully get exercises', async () => {
    const result = await exerciseRepo.findByIds(
      ['3ddb278c-508f-4131-9427-9b42863263f6'],
      '3781951f-bec1-45db-b8c6-e772258d8ddb',
    );

    expect(result.length).toBe(1);
  });
});

import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';
import { Pool } from 'pg';

export async function loadDataIntoTestDb(pathName: string) {
  const pool = global.getDbPool();
  const rawData = fs.readFileSync(
    path.join(process.cwd(), '/test/integration/db-files', pathName),
    'utf-8',
  );
  const data = yaml.load(rawData) as Record<string, any[]>;
  for (const key of Object.keys(data)) {
    await insertIntoDb(key, data[key], pool);
  }
}

export async function clearDb() {
  const pool = global.getDbPool();

  const result = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename NOT IN ('equipment', 'body_part', 'migrations');
    `);

  const tableNames = result.rows.map((row) => row.tablename);

  for (const table of tableNames) {
    if (table === 'exercise') {
      await pool.query(`DELETE FROM "${table}" WHERE is_custom = true`);
    } else {
      await pool.query(`DELETE FROM "${table}"`);
    }
  }
}

async function insertIntoDb(key: string, value: any[], pool: Pool) {
  for (const item of value) {
    const params = Object.keys(item)
      .map((key) => `"${key}"`)
      .join(', ');

    const values = Object.values(item)
      .map((val) => {
        if (typeof val === 'string') {
          return `'${val}'`;
        } else {
          return val;
        }
      })
      .join(', ');

    const query = `
        INSERT INTO "${key}" (${params})
        VALUES (${values})
    `;

    await pool.query(query);
  }
}

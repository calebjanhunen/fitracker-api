import { Test, TestingModule } from '@nestjs/testing';
import { exec, spawn } from 'child_process';
import { Pool } from 'pg';
import { promisify } from 'util';
import { DbModule } from '../../src/common/database/database.module';
import { DbService } from '../../src/common/database/database.service';
/* eslint-disable @typescript-eslint/no-var-requires */
const dotenv = require('dotenv');
const path = require('path');

const execAsync = promisify(exec);

async function globalSetup() {
  // set the .env.test environment variables (to use test db)
  dotenv.config({ path: '.env.test' });

  try {
    await runTestDBDockerContainer();
  } catch (e) {
    console.error('Failed to start test-db docker container: ', e);
    return;
  }

  const pool = createPostgresPool();
  global.dbService = new DbService();

  try {
    await waitForDbConnection(pool);
  } catch (e) {
    console.error('Database connection could not be established:', e);
    return;
  }

  try {
    await runDatabaseMigrations();
  } catch (e) {
    console.error('Error running migrations: ', e);
    return;
  }
}

async function waitForDbConnection(pool: Pool) {
  console.log('Connecting to database...');
  await new Promise((res) => setTimeout(res, 5000));
  for (let i = 0; i < 10; i++) {
    // Retry up to 10 times
    try {
      await pool.query('SELECT 1');
      console.log('Database connection established.');
      return;
    } catch (e) {
      console.log(`Database connection failed. Retrying (${i + 1}/10)...`);
      await new Promise((res) => setTimeout(res, 5000)); // Wait for 5 seconds before retrying
    }
  }
  throw new Error('Failed to connect to the database after multiple attempts.');
}

async function runTestDBDockerContainer() {
  console.log('\nStarting test-db docker container...');
  return new Promise<void>((resolve, reject) => {
    const runDockerCommand = spawn('docker-compose', ['up', '-d', 'test-db']);

    runDockerCommand.stdout.on('data', (data) => {
      console.log(data.toString().trim());
    });

    runDockerCommand.stderr.on('data', (data) => {
      // docker status logs are sent to stderr stream so need to differentiate between errors and status updates
      const message = data.toString().trim();
      if (message.toLowerCase().includes('error')) {
        console.error('Error: ', message);
      } else {
        console.log(message);
      }
    });

    runDockerCommand.on('close', (code) => {
      if (code === 0) {
        console.log('test-db container started successfully.');
        console.log('\n');
        resolve();
      } else {
        reject(
          new Error(`run docker container process exited with code: ${code}`),
        );
      }
    });

    runDockerCommand.on('error', (error) => {
      reject(error);
    });
  });
}

function createPostgresPool(): Pool {
  // Create postgres pool using testdb environment variables
  const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: +(process.env.POSTGRES_PORT as string),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
  });

  // set global function to be used in all .int-spec files to get the pool connection
  global.getDbPool = () => pool;
  return pool;
}

async function runDatabaseMigrations() {
  console.log('Running database migrations...');
  return new Promise<void>((resolve, reject) => {
    const runMigrationsCommand = spawn(
      'npx',
      [
        'db-migrate',
        'up',
        '--env',
        'test',
        '--config',
        path.join(__dirname, '../../database/database.js'),
        '--migrations-dir',
        path.join(__dirname, '../../database/migrations'),
        ,
      ],
      { shell: true },
    );
    runMigrationsCommand.stdout.on('data', (data) => {
      console.log(data.toString().trim());
    });

    runMigrationsCommand.stderr.on('data', (data) => {
      console.error(data.toString().trim());
    });

    runMigrationsCommand.on('close', (code) => {
      if (code === 0) {
        console.log('Migrations successfully ran.');
        console.log('\n');
        resolve();
      } else {
        reject(new Error(`run migrations process exited with code: ${code}`));
      }
    });

    runMigrationsCommand.on('error', (error) => {
      reject(error);
    });
  });
}

export default globalSetup;

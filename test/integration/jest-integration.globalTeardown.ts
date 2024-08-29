import { exec, spawn } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

async function globalTeardown() {
  console.log('Running global teardown...');
  try {
    const pool = global.getDbPool();
    if (pool) {
      console.log('Closing postgres pool connection...');
      await pool.end();
      console.log('Successfully closed posgres pool.');
    }
    await global.dbService.closePool();
    await execAsync('docker-compose down test-db');
    console.log('Docker container stopped and removed successfully.');
  } catch (error) {
    console.error('Error stopping/removing Docker container:', error);
  }
}

export default globalTeardown;

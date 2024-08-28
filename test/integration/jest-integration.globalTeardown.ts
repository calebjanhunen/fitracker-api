import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

async function globalTeardown() {
  console.log('Running global teardown...');
  try {
    await execAsync('docker-compose down test-db');
    console.log('Docker container stopped and removed successfully.');
  } catch (error) {
    console.error('Error stopping/removing Docker container:', error);
    throw error;
  }
}

export default globalTeardown;

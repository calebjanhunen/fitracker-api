import { Test, TestingModule } from '@nestjs/testing';
import {
  clearDatabase,
  loadDataFromJsonIntoDb,
} from 'src/scripts/load-data-into-test-db';
import { getIntegrationDataSourceInstance } from 'test/integration/integration-test-datasource';
import { IntegrationTestModule } from 'test/integration/jest-integration.module';

let pathToJsonFile: string;

export async function setupTestEnvironment(path: string) {
  pathToJsonFile = path;
  const module = await Test.createTestingModule({
    imports: [IntegrationTestModule],
  }).compile();

  return module;
}

export async function teardownTestEnvironment(module: TestingModule) {
  const dataSourceInstance = await getIntegrationDataSourceInstance();
  try {
    await clearDatabase(dataSourceInstance);
    await dataSourceInstance.dropDatabase();
    await dataSourceInstance.destroy();
    await module.close();
  } catch (e) {
    console.error('Failed to teardown environment: ', e);
  }
}

export async function resetDatabase() {
  const dataSourceInstance = await getIntegrationDataSourceInstance();
  try {
    clearDatabase(dataSourceInstance);
    await loadDataFromJsonIntoDb(pathToJsonFile, dataSourceInstance);
  } catch (e) {
    console.error('Could not reset database: ', e);
  }
}

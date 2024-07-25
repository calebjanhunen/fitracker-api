import { Test, TestingModule } from '@nestjs/testing';
import {
  clearDatabase,
  loadDataFromJsonIntoDb,
} from 'src/scripts/load-data-into-test-db';
import { getIntegrationDataSourceInstance } from 'test/integration/integration-test-datasource';
import { IntegrationTestModule } from 'test/integration/jest-integration.module';

export async function setupTestEnvironment(pathToJsonFile: string) {
  const dataSourceInstance = await getIntegrationDataSourceInstance();
  const module = await Test.createTestingModule({
    imports: [IntegrationTestModule],
  }).compile();

  await loadDataFromJsonIntoDb(pathToJsonFile, dataSourceInstance);
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

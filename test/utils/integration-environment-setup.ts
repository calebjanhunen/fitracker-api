import { Test, TestingModule } from '@nestjs/testing';
import {
  clearDatabase,
  loadDataFromJsonIntoDb,
} from 'src/scripts/load-data-into-test-db';
import { integrationDataSource } from 'test/integration/integration-test-datasource';
import { IntegrationTestModule } from 'test/integration/jest-integration.module';

export async function setupTestEnvironment(pathToJsonFile: string) {
  const module = await Test.createTestingModule({
    imports: [IntegrationTestModule],
  }).compile();

  await integrationDataSource.initialize();
  await loadDataFromJsonIntoDb(pathToJsonFile, integrationDataSource);

  return module;
}

export async function teardownTestEnvironment(module: TestingModule) {
  await clearDatabase(integrationDataSource);
  await integrationDataSource.destroy();
  await module.close();
}

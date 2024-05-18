import { dataSource } from '../src/config/typeorm-datasource.config';

module.exports = async () => {
  try {
    await dataSource.initialize();
    await dataSource.dropDatabase();
    console.log('Test database dropped successfully.');
  } catch (error) {
    console.error('Failed to drop test database:', error);
  } finally {
    await dataSource.destroy();
  }
};

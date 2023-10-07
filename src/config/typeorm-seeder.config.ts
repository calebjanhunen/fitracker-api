import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions, runSeeders } from 'typeorm-extension';
import { dataSource } from './typeorm-datasource.config';
import typeormConfig from './typeorm.config';

const seederConfigOptions: DataSourceOptions & SeederOptions = {
  ...(typeormConfig as DataSourceOptions),
  seeds: [__dirname + '/../database/seeders/.seed.{ts,js}'],
};

export const seederDatasource = new DataSource(seederConfigOptions);

seederDatasource.initialize().then(async () => {
  await dataSource.synchronize(true);
  await runSeeders(seederDatasource);
  process.exit();
});

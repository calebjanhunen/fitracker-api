import { DataSource, DataSourceOptions } from 'typeorm';
import typeormConfig from './typeorm.config';

export const dataSource = new DataSource({
  ...(typeormConfig as DataSourceOptions),
});

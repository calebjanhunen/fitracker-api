import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

export const typeormConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  port: parseInt(process.env.POSTGRES_PORT as string),
  host: process.env.POSTGRES_HOST,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  // entities: [__dirname + '/../model/*.entity.{ts,js}'],
  migrationsTableName: 'migrations',
  migrations: [__dirname + '/../database/migrations/*.ts'],
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: true, // TODO: remove after initial database setup
  autoLoadEntities: true,
};

// For nestjs connection
export default typeormConfig;

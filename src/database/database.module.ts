import { Module, Provider } from '@nestjs/common';
import { Pool } from 'pg';
import { DB_CONNECTION } from './constants';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

const dbProvider: Provider<Pool> = {
  provide: DB_CONNECTION,
  useValue: new Pool({
    host: process.env.POSTGRES_HOST,
    port: +(process.env.POSTGRES_PORT as string),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
  }),
};

@Module({
  providers: [dbProvider],
  exports: [dbProvider],
})
export class DbModule {}

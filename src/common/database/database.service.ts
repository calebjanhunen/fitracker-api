// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
});

import {
  Injectable,
  Logger,
  LoggerService,
  OnModuleDestroy,
} from '@nestjs/common';
import { Pool, QueryResult, QueryResultRow } from 'pg';
import { DatabaseException } from '../internal-exceptions/database.exception';

@Injectable()
export class DbService implements OnModuleDestroy {
  private readonly pool: Pool;
  private readonly logger: LoggerService;
  constructor() {
    this.logger = new Logger(DbService.name);
    this.pool = new Pool({
      host: process.env.POSTGRES_HOST,
      port: +(process.env.POSTGRES_PORT as string),
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
    });
  }

  public async query<T extends QueryResultRow>(
    queryName: string,
    query: string,
    parameters: (string | number | boolean | null)[],
  ): Promise<QueryResult<T>> {
    try {
      const startTime = Date.now();

      const result = await this.pool.query(query, parameters);

      const endTime = Date.now();

      if (process.env.NODE_ENV !== 'test') {
        this.logger.log(`${queryName} query took ${endTime - startTime}ms`);
      }

      return result;
    } catch (e) {
      this.logger.error(`Query: ${queryName} failed: `, e);
      throw new DatabaseException(e.message);
    }
  }

  public async closePool() {
    await this.pool.end();
  }

  public async onModuleDestroy() {
    await this.closePool();
  }
}

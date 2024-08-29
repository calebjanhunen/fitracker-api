// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import { Injectable } from '@nestjs/common';
import { Pool, QueryResult, QueryResultRow } from 'pg';

interface QueryResponse<T extends QueryResultRow> {
  result: QueryResult<T>;
  elapsedTime: number;
}

@Injectable()
export class DbService {
  private readonly pool: Pool;
  constructor() {
    this.pool = new Pool({
      host: process.env.POSTGRES_HOST,
      port: +(process.env.POSTGRES_PORT as string),
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
    });
  }

  public async query<T extends QueryResultRow>(
    query: string,
    parameters: (string | number | boolean | null)[],
  ): Promise<QueryResponse<T>> {
    const startTime = Date.now();
    const result = await this.pool.query(query, parameters);
    const endTime = Date.now();

    return { result, elapsedTime: endTime - startTime };
  }
}

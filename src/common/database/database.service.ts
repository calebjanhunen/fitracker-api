// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
});

import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool, PoolClient, QueryResultRow } from 'pg';
import { DatabaseException } from '../internal-exceptions/database.exception';

@Injectable()
export class DbService implements OnModuleDestroy {
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

  /**
   * Queries the postgres database using pg pool.
   * Gets the elapsed time that a query takes.
   * Converts all fields retrived by the query to camel case.
   *
   * @param {string} queryName
   * @param {string} query
   * @param {(string | number | boolean | null)[]} parameters
   * @returns {T[]}
   *
   * @throws {DatabaseException}
   */
  public async queryV2<T extends QueryResultRow>(
    query: string,
    parameters: (
      | string
      | string[]
      | number
      | boolean
      | Date
      | null
      | undefined
    )[],
  ): Promise<{ queryResult: T[]; elapsedTime: number }> {
    const startTime = Date.now();
    const result = await this.pool.query<T>(query, parameters);
    const endTime = Date.now();

    return {
      queryResult: this.toCamelCase(result.rows),
      elapsedTime: this.getElapsedTime(startTime, endTime),
    };
  }

  /**
   * Runs the queries in the callback function in a transaction
   * to ensure they get rolledback on any error
   * @param {(client: PoolClient) => Promise<T>} callback
   * @returns {T}
   */
  public async transaction<T>(
    callback: (client: PoolClient) => Promise<T>,
  ): Promise<{ queryResult: T; elapsedTime: number }> {
    const client = await this.pool.connect();
    try {
      const startTime = Date.now();

      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');

      const endTime = Date.now();
      return {
        queryResult: result,
        elapsedTime: this.getElapsedTime(startTime, endTime),
      };
    } catch (e) {
      await client.query('ROLLBACK');
      throw new DatabaseException(e.message);
    } finally {
      client.release();
    }
  }

  private getElapsedTime(startTime: number, endTime: number): number {
    return endTime - startTime;
  }

  /**
   * Converts all object keys from snake case to camel case
   * @param {any} obj
   * @returns {any}
   */
  private toCamelCase(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((v) => this.toCamelCase(v));
    } else if (obj !== null && obj.constructor === Object) {
      return Object.keys(obj).reduce((result, key) => {
        const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        result[camelKey] = this.toCamelCase(obj[key]);
        return result;
      }, {} as any);
    }
    return obj;
  }

  public async closePool() {
    await this.pool.end();
  }

  public async onModuleDestroy() {
    await this.closePool();
  }
}

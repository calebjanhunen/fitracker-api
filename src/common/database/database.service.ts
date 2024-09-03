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
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { DatabaseException } from '../internal-exceptions/database.exception';

@Injectable()
export class DbService implements OnModuleDestroy {
  private readonly pool: Pool;
  private poolClient: PoolClient;
  private readonly logger: LoggerService;

  // For transaction queries
  private transactionStartTime: number;

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

  /**
   * @deprecated Use queryV2
   */
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
    queryName: string,
    query: string,
    parameters: (string | number | boolean | null)[],
  ): Promise<T[]> {
    try {
      const startTime = Date.now();
      const result = await this.pool.query<T>(query, parameters);
      const endTime = Date.now();

      if (process.env.NODE_ENV !== 'test') {
        this.logger.log(`${queryName} query took ${endTime - startTime}ms`);
      }
      return this.toCamelCase(result.rows);
    } catch (e) {
      this.logger.error(`Query: ${queryName} failed: `, e);
      throw new DatabaseException(e.message);
    }
  }

  public async transaction<T>(
    callback: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (e) {
      await client.query('ROLLBACK');
      throw new DatabaseException(e.message);
    } finally {
      client.release();
    }
  }

  /**
   * Connects to a client in the pool to run transactions
   *
   * @returns {PoolClient}
   */
  public async connect(): Promise<PoolClient> {
    this.poolClient = await this.pool.connect();
    return this.poolClient;
  }

  /**
   * Starts a transaction
   */
  public async startTransaction(): Promise<void> {
    this.transactionStartTime = Date.now();
    await this.poolClient.query('BEGIN');
  }

  /**
   * Commits the queries in a transaction
   *
   * @param {string} queryName
   */
  public async commitTransaction(queryName: string): Promise<void> {
    await this.poolClient.query('COMMIT');

    if (process.env.NODE_ENV !== 'test') {
      this.logger.log(
        `${queryName} query took ${Date.now() - this.transactionStartTime}ms`,
      );
    }

    this.transactionStartTime = 0;
  }

  /**
   * Rollback queries in a transaction
   */
  public async rollbackTransaction(queryName: string, e: Error): Promise<void> {
    await this.poolClient.query('ROLLBACK');
    this.logger.log(`DB Query ${queryName} failed: ${e}`);
    throw new DatabaseException(e.message);
  }

  /**
   * Releases the pool client back to the pool
   */
  public async releaseClient(): Promise<void> {
    this.poolClient.release();
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

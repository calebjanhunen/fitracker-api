import { Pool } from 'pg';

// Used for integration tests to get the pool instance
/* eslint-disable no-var */
declare global {
  function getDbPool(): Pool;
}

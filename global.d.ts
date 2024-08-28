import { Pool } from 'pg';

/* eslint-disable no-var */
declare global {
  function getDbPool(): Pool;
}

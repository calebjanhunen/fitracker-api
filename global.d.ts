import { Pool } from 'pg';
import { DbService } from 'src/common/database/database.service';

// Used for integration tests to get the pool instance
/* eslint-disable no-var */
declare global {
  function getDbPool(): Pool;
  var dbService: DbService;
}

import { DatabaseException } from '../internal-exceptions';
import { LoggerService } from '../logger/logger.service';

export abstract class BaseRepository {
  constructor(
    private readonly logger: LoggerService,
    context: string,
  ) {
    this.logger.setContext(context);
  }

  public handleError(e: Error, queryName: string) {
    this.logger.error(e, `Query ${queryName} failed`, { queryName });
    throw new DatabaseException(e.message);
  }
}

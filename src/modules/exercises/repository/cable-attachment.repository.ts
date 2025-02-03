import { Injectable } from '@nestjs/common';
import { DbService } from 'src/common/database';
import { DatabaseException } from 'src/common/internal-exceptions/database.exception';
import { LoggerService } from 'src/common/logger/logger.service';
import { LookupItem } from '../models';

@Injectable()
export class CableAttachmentRepository {
  constructor(
    private readonly db: DbService,
    private readonly logger: LoggerService,
  ) {}

  public async getAllAttachments(): Promise<LookupItem[]> {
    const queryName = 'getAllAttachments';
    const query = `
        SELECT
          id,
          name
        FROM public.cable_attachment
    `;

    try {
      const { queryResult } = await this.db.queryV2<LookupItem>(query, []);

      return queryResult;
    } catch (e) {
      this.logger.error(e, `Query ${queryName} failed: `, { queryName });
      throw new DatabaseException(e.message);
    }
  }

  public async getAttachmentById(id: number): Promise<LookupItem | null> {
    const queryName = 'getAttachmentById';
    const query = `
        SELECT
          id,
          name
        FROM public.cable_attachment
        WHERE id = $1
    `;
    const params = [id];

    try {
      const { queryResult } = await this.db.queryV2<LookupItem>(query, params);

      if (!queryResult.length) {
        return null;
      }

      return queryResult[0];
    } catch (e) {
      this.logger.error(e, `Query ${queryName} failed: `, { queryName });
      throw new DatabaseException(e.message);
    }
  }
}

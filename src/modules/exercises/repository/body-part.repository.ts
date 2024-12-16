import { Injectable } from '@nestjs/common';
import { DbService } from 'src/common/database/database.service';
import { BodyPartModel } from '../../exercises/models/body-part.model';

@Injectable()
export class BodyPartRepository {
  constructor(private readonly db: DbService) {}

  public async findById(id: number): Promise<BodyPartModel | null> {
    const query = `
        SELECT id, name
        FROM body_part
        WHERE id = $1
    `;
    const params = [id];

    const { queryResult } = await this.db.queryV2<BodyPartModel>(query, params);

    if (queryResult.length === 0) {
      return null;
    }
    return queryResult[0];
  }

  public async findAll(): Promise<BodyPartModel[]> {
    const query = `
        SELECT
          id,
          name
        FROM body_part
    `;

    const { queryResult } = await this.db.queryV2<BodyPartModel>(query, []);

    return queryResult;
  }
}

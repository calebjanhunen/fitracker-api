import { Injectable } from '@nestjs/common';
import { DbService } from 'src/common/database/database.service';
import { BodyPartModel } from '../models/body-part.model';

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

    const result = await this.db.query<BodyPartModel>(
      'GetBodyPartById',
      query,
      params,
    );

    if (result.rows.length === 0) {
      return null;
    }
    return BodyPartModel.fromDbQuery(result.rows[0]);
  }
}

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

    const result = await this.db.queryV2<BodyPartModel>(
      'GetBodyPartById',
      query,
      params,
    );

    if (result.length === 0) {
      return null;
    }
    return result[0];
  }

  public async findAll(): Promise<BodyPartModel[]> {
    const query = `
        SELECT
          id,
          name
        FROM body_part
    `;

    const result = await this.db.queryV2<BodyPartModel>(
      'FindAllBodyParts',
      query,
      [],
    );

    return result;
  }
}

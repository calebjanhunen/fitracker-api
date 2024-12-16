import { Injectable } from '@nestjs/common';
import { DbService } from 'src/common/database/database.service';
import { EquipmentModel } from '../../exercises/models/equipment.model';

@Injectable()
export class EquipmentRepository {
  constructor(private readonly db: DbService) {}

  public async findById(id: number): Promise<EquipmentModel | null> {
    const query = `
        SELECT id, name
        FROM equipment
        WHERE id = $1
    `;
    const params = [id];

    const { queryResult } = await this.db.queryV2<EquipmentModel>(
      query,
      params,
    );

    if (queryResult.length === 0) {
      return null;
    }
    return queryResult[0];
  }

  public async findAll(): Promise<EquipmentModel[]> {
    const query = `
        SELECT
          id,
          name
        FROM equipment
    `;

    const { queryResult } = await this.db.queryV2<EquipmentModel>(query, []);

    return queryResult;
  }
}

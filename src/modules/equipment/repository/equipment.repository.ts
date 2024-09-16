import { Injectable } from '@nestjs/common';
import { DbService } from 'src/common/database/database.service';
import { EquipmentModel } from '../models/equipment.model';

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

    const result = await this.db.queryV2<EquipmentModel>(
      'GetEquipmentById',
      query,
      params,
    );

    if (result.length === 0) {
      return null;
    }
    return result[0];
  }

  public async findAll(): Promise<EquipmentModel[]> {
    const query = `
        SELECT
          id,
          name
        FROM equipment
    `;

    const result = await this.db.queryV2<EquipmentModel>(
      'FindAllEquipment',
      query,
      [],
    );

    return result;
  }
}

import { DbService } from 'src/common/database/database.service';
import { EquipmentModel } from '../models/equipment.model';

export class EquipmentRepository {
  constructor(private readonly db: DbService) {}

  public async findById(id: number): Promise<EquipmentModel | null> {
    const query = `
        SELECT id, name
        FROM equipment
        WHERE id = $1
    `;
    const params = [id];

    const result = await this.db.query<EquipmentModel>(
      'GetEquipmentById',
      query,
      params,
    );

    if (result.rows.length === 0) {
      return null;
    }
    return EquipmentModel.fromDbQuery(result.rows[0]);
  }
}

import { Injectable } from '@nestjs/common';
import { EquipmentModel } from '../models/equipment.model';
import { EquipmentRepository } from '../repository/equipment.repository';

@Injectable()
export class EquipmentService {
  constructor(private readonly equipmentRepo: EquipmentRepository) {}

  public async findById(id: number): Promise<EquipmentModel | null> {
    return this.equipmentRepo.findById(id);
  }

  public async findAll(): Promise<EquipmentModel[]> {
    const equipment = await this.equipmentRepo.findAll();

    // Capitalize first letter of name
    return equipment.map((e) => ({
      ...e,
      name: e.name.charAt(0).toUpperCase() + e.name.slice(1),
    }));
  }
}

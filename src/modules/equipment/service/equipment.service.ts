import { Injectable } from '@nestjs/common';
import { EquipmentModel } from '../models/equipment.model';
import { EquipmentRepository } from '../repository/equipment.repository';

@Injectable()
export class EquipmentService {
  constructor(private readonly equipmentRepo: EquipmentRepository) {}

  public async findById(id: number): Promise<EquipmentModel | null> {
    return this.equipmentRepo.findById(id);
  }
}

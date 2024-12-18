import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { ConflictException, Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { EquipmentDto } from '../dtos/equipment.dto';
import { EquipmentModel } from '../models/equipment.model';
import { EquipmentService } from '../services/equipment.service';

@Controller('/api/equipment')
@UseGuards(JwtAuthGuard)
export class EquipmentController {
  constructor(
    private readonly equipmentService: EquipmentService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  @Get()
  public async getAllEquipment(): Promise<EquipmentDto[]> {
    try {
      const equipment = await this.equipmentService.findAll();
      return this.mapper.mapArray(equipment, EquipmentModel, EquipmentDto);
    } catch (e) {
      throw new ConflictException(e.message);
    }
  }
}

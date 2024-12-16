import { ConflictException, Controller, Get, UseGuards } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { EquipmentDto } from '../dtos/equipment.dto';
import { EquipmentService } from '../services/equipment.service';

@Controller('/api/equipment')
@UseGuards(JwtAuthGuard)
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get()
  public async getAllEquipment(): Promise<EquipmentDto[]> {
    try {
      const equipment = await this.equipmentService.findAll();
      return plainToInstance(EquipmentDto, equipment);
    } catch (e) {
      throw new ConflictException(e.message);
    }
  }
}

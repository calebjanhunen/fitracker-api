import { ConflictException, Controller, Get, UseGuards } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { EquipmentDto } from '../dtos/equipment.dto';
import { EquipmentService } from '../service/equipment.service';

@Controller('/api/equipment')
@UseGuards(AuthGuard)
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

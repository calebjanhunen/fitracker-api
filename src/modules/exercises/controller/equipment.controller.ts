import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  ConflictException,
  Controller,
  Get,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { EquipmentDto } from '../dtos/equipment.dto';
import { EquipmentModel } from '../models/equipment.model';
import { EquipmentService } from '../services/equipment.service';

@Controller('/api/equipment')
@UseGuards(JwtAuthGuard)
@ApiTags('Exercises')
@ApiBearerAuth('access-token')
export class EquipmentController {
  constructor(
    private readonly equipmentService: EquipmentService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  @Get()
  @ApiResponse({ status: HttpStatus.OK, type: EquipmentDto, isArray: true })
  @ApiResponse({ status: HttpStatus.CONFLICT })
  public async getAllEquipment(): Promise<EquipmentDto[]> {
    try {
      const equipment = await this.equipmentService.findAll();
      return this.mapper.mapArray(equipment, EquipmentModel, EquipmentDto);
    } catch (e) {
      throw new ConflictException(e.message);
    }
  }
}

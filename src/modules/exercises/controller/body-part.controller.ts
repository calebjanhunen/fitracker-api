import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { ConflictException, Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { BodyPartDto } from '../dtos/body-part.dto';
import { BodyPartModel } from '../models/body-part.model';
import { BodyPartService } from '../services/body-part.service';

@Controller('/api/body-parts')
export class BodyPartController {
  constructor(
    private readonly bodyPartService: BodyPartService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  public async getAllBodyParts(): Promise<BodyPartDto[]> {
    try {
      const bodyParts = await this.bodyPartService.findAll();
      return this.mapper.mapArray(bodyParts, BodyPartModel, BodyPartDto);
    } catch (e) {
      throw new ConflictException(e.message);
    }
  }
}

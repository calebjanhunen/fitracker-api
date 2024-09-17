import { ConflictException, Controller, Get, UseGuards } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { BodyPartDto } from '../dtos/body-part.dto';
import { BodyPartService } from '../service/body-part.service';

@Controller('/api/body-parts')
@UseGuards(AuthGuard)
export class BodyPartController {
  constructor(private readonly bodyPartService: BodyPartService) {}

  @Get()
  public async getAllBodyParts(): Promise<BodyPartDto[]> {
    try {
      const bodyParts = await this.bodyPartService.findAll();
      return plainToInstance(BodyPartDto, bodyParts);
    } catch (e) {
      throw new ConflictException(e.message);
    }
  }
}

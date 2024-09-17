import { Module } from '@nestjs/common';

import { DbModule } from 'src/common/database/database.module';
import { EquipmentController } from './controller/equipment.controller';
import { EquipmentRepository } from './repository/equipment.repository';
import { EquipmentService } from './service/equipment.service';

@Module({
  imports: [DbModule],
  controllers: [EquipmentController],
  providers: [EquipmentService, EquipmentRepository],
  exports: [EquipmentService],
})
export class EquipmentModule {}

import { Module } from '@nestjs/common';

import { DbModule } from 'src/common/database/database.module';
import { EquipmentRepository } from './repository/equipment.repository';
import { EquipmentService } from './service/equipment.service';

@Module({
  imports: [DbModule],
  controllers: [],
  providers: [EquipmentService, EquipmentRepository],
  exports: [EquipmentService],
})
export class EquipmentModule {}

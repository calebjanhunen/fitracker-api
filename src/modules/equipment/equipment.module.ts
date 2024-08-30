import { Module } from '@nestjs/common';

import { DbModule } from 'src/common/database/database.module';
import { EquipmentRepository } from './repository/equipment.repository';

@Module({
  imports: [DbModule],
  controllers: [],
  providers: [EquipmentRepository],
  exports: [EquipmentRepository],
})
export class EquipmentModule {}

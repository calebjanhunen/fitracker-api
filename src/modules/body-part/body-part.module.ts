import { Module } from '@nestjs/common';

import { DbModule } from 'src/common/database/database.module';
import { BodyPartRepository } from './repository/body-part.repository';
import { BodyPartService } from './service/body-part.service';

@Module({
  imports: [DbModule],
  controllers: [],
  providers: [BodyPartRepository, BodyPartService],
  exports: [BodyPartService],
})
export class BodyPartModule {}

import { Module } from '@nestjs/common';

import { DbModule } from 'src/common/database/database.module';
import { BodyPartController } from './controller/body-part.controller';
import { BodyPartRepository } from './repository/body-part.repository';
import { BodyPartService } from './service/body-part.service';

@Module({
  imports: [DbModule],
  controllers: [BodyPartController],
  providers: [BodyPartRepository, BodyPartService],
  exports: [BodyPartService],
})
export class BodyPartModule {}

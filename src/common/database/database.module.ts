import { Module } from '@nestjs/common';
import { DbService } from './database.service';

@Module({
  providers: [DbService],
  exports: [DbService],
})
export class DbModule {}

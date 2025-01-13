import { Module } from '@nestjs/common';
import { DbModule } from 'src/common/database/database.module';

@Module({
  imports: [DbModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class LeaderboardModule {}

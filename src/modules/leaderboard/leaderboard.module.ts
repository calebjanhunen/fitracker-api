import { Module } from '@nestjs/common';
import { DbModule } from 'src/common/database/database.module';
import { LeaderboardMapperProfile } from './leaderboard-mapper.profile';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardRepository } from './leaderboard.repository';
import { LeaderboardService } from './leaderboard.service';

@Module({
  imports: [DbModule],
  controllers: [LeaderboardController],
  providers: [
    LeaderboardService,
    LeaderboardRepository,
    LeaderboardMapperProfile,
  ],
  exports: [],
})
export class LeaderboardModule {}

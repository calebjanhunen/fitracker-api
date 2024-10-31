import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { LoggerServiceV2 } from 'src/common/logger/logger-v2.service';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class UserCronService {
  constructor(
    private logger: LoggerServiceV2,
    private userRepo: UserRepository,
  ) {
    this.logger.setContext(UserCronService.name);
  }

  @Cron('0 0 * * 0', {
    timeZone: 'UTC',
  })
  public async handleResetUserWeeklyWorkoutGoalStreak() {
    this.logger.log(
      `Cron job 'handleResetUserWeeklyWorkoutGoalStreak' started at ${new Date().toUTCString()}`,
    );

    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);

    try {
      const statsForAllUsers = await this.userRepo.getStatsForAllUsers();
      statsForAllUsers.forEach(async (stat) => {
        if (
          !stat.weeklyBonusAwardedAt?.isBetween(
            this.getDateSevenDaysAgo(now),
            now,
          ) &&
          stat.weeklyWorkoutGoalStreak > 0
        ) {
          stat.weeklyWorkoutGoalStreak = 0;
          await this.userRepo.updateUserStats(stat, stat.userId);
          this.logger.debug(
            `Reset weekly goal streak for user: ${stat.userId}`,
          );
        }
      });
      this.logger.log(
        `Cron job 'handleResetUserWeeklyWorkoutGoalStreak' completed successfully at ${new Date().toUTCString()}`,
      );
    } catch (e) {
      this.logger.error(
        `Cron job 'handleResetUserWeeklyWorkoutGoalStreak' failed with error: `,
        e,
      );
    }
  }

  private getDateSevenDaysAgo(date: Date) {
    const dateSevenDaysAgo = new Date();
    dateSevenDaysAgo.setUTCHours(0, 0, 0, 0);
    dateSevenDaysAgo.setUTCDate(date.getUTCDate() - 7);
    return dateSevenDaysAgo;
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MyLoggerService } from 'src/common/logger/logger.service';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class UserCronService {
  constructor(
    @Inject('UserCronServiceLogger') private logger: MyLoggerService,
    private userRepo: UserRepository,
  ) {}

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

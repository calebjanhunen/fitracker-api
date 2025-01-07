import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LoggerService } from 'src/common/logger/logger.service';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class UserCronService {
  constructor(
    private logger: LoggerService,
    private userRepo: UserRepository,
  ) {
    this.logger.setContext(UserCronService.name);
  }

  @Cron(CronExpression.EVERY_WEEK, { timeZone: 'UTC' })
  public async resetUserWeeklyWorkoutGoalStreak() {
    const cronJob = 'resetUserWeeklyWorkoutGoalStreak';
    this.logger.log(`Start cron job ${cronJob}`, { cronJob });

    try {
      const startTime = Date.now();
      const allUserStats = await this.userRepo.getStatsForAllUsers();
      const todayAtMidnight = this.getTodayAtMidnight();

      for (const userStat of allUserStats) {
        if (!userStat.weeklyWorkoutGoalAchievedAt) {
          continue;
        }
        if (
          !userStat.weeklyWorkoutGoalAchievedAt.isWithinSevenDaysFrom(
            todayAtMidnight,
          )
        ) {
          userStat.weeklyWorkoutGoalStreak = 0;
          await this.userRepo.updateUserStats(userStat, userStat.userId);

          this.logger.log(
            `Reset weekly workout goal streak for user ${userStat.userId}`,
            { userId: userStat.userId },
          );
        }
      }

      const endTime = Date.now();
      const elapsedTimeMs = endTime - startTime;
      this.logger.log(`Finish cron job ${cronJob} in ${elapsedTimeMs}ms`, {
        cronJob,
        elapsedTimeMs,
      });
    } catch (e) {
      this.logger.error(e, `Cron job ${cronJob} failed`, { cronJob });
    }
  }

  private getTodayAtMidnight(): Date {
    const timestamp = new Date().setHours(0, 0, 0, 0);
    return new Date(timestamp);
  }
}

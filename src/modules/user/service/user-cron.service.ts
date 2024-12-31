import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
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

  @Cron('0 0 * * 0', {
    timeZone: 'UTC',
  })
  public async handleResetUserWeeklyWorkoutGoalStreak() {
    this.logger.log(
      `Cron job 'handleResetUserWeeklyWorkoutGoalStreak' is not implemented yet.`,
    );
  }
}

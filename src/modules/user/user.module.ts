import { Module } from '@nestjs/common';

import { DbModule } from 'src/common/database/database.module';
import { LoggerServiceV2 } from 'src/common/logger/logger-v2.service';
import { MyLoggerService } from 'src/common/logger/logger.service';
import { UserController } from './controller/user.controller';
import { UserRepository } from './repository/user.repository';
import { UserCronService } from './service/user-cron.service';
import { UserService } from './service/user.service';
import { UserProfile } from './user.profile';

@Module({
  imports: [DbModule],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    UserProfile,
    UserCronService,
    {
      provide: 'UserRepoLogger',
      useFactory: () => new MyLoggerService(UserRepository.name),
    },
    {
      provide: 'UserServiceLogger',
      useFactory: () => new MyLoggerService(UserService.name),
    },
    {
      provide: 'UserCronServiceLogger',
      useFactory: () => new MyLoggerService(UserCronService.name),
    },
    {
      provide: 'UserControllerLogger',
      useFactory: () => new MyLoggerService(UserController.name),
    },
    LoggerServiceV2,
  ],
  exports: [UserService],
})
export class UserModule {}

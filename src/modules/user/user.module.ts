import { Module } from '@nestjs/common';

import { DbModule } from 'src/common/database/database.module';
import { LoggerServiceV2 } from 'src/common/logger/logger-v2.service';
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
    LoggerServiceV2,
  ],
  exports: [UserService],
})
export class UserModule {}

import { Module } from '@nestjs/common';

import { DbModule } from 'src/common/database/database.module';
import { UserController } from './controller/user.controller';
import { UserRefreshTokenReposistory } from './repository/user-refresh-token.repository';
import { UserRepository } from './repository/user.repository';
import { UserCronService } from './service/user-cron.service';
import { UserRefreshTokenService } from './service/user-refresh-token.service';
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
    UserRefreshTokenReposistory,
    UserRefreshTokenService,
  ],
  exports: [UserService, UserRefreshTokenService],
})
export class UserModule {}

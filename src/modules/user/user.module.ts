import { Module } from '@nestjs/common';

import { DbModule } from 'src/common/database/database.module';
import { MyLoggerService } from 'src/common/logger/logger.service';
import { UserController } from './controller/user.controller';
import { UserRepository } from './repository/user.repository';
import { UserService } from './service/user.service';
import { UserProfile } from './user.profile';

@Module({
  imports: [DbModule],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    UserProfile,
    {
      provide: 'UserRepoLogger',
      useFactory: () => new MyLoggerService(UserRepository.name),
    },
    {
      provide: 'UserServiceLogger',
      useFactory: () => new MyLoggerService(UserService.name),
    },
  ],
  exports: [UserService],
})
export class UserModule {}

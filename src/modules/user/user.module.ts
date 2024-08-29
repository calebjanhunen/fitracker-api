import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { DbModule } from 'src/common/database/database.module';
import { UserController } from './controller/user.controller';
import { User } from './models/user.entity';
import { UserRepository } from './repository/user.repository';
import { UserService } from './service/user.service';

@Module({
  imports: [DbModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}

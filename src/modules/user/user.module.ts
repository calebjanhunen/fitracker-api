import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './models/user.entity';

import { DbModule } from 'src/common/database/database.module';
import { UserController } from './controller/user.controller';
import { UserRepository } from './repository/user.repository';
import { UserService } from './service/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), DbModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}

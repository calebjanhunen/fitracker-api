import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { InsertUserModel } from '../user/models/insert-user.model';
import UserSignupDto from './dto/user-signup-dto';

@Injectable()
export class AuthMapperProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, UserSignupDto, InsertUserModel);
    };
  }
}

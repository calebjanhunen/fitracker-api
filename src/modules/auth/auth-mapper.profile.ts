import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { UserResponseDto } from '../user/dtos/user-response.dto';
import { InsertUserModel } from '../user/models/insert-user.model';
import { UserModel } from '../user/models/user.model';
import UserSignupDto from './dto/user-signup-dto';

@Injectable()
export class AuthMapperProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, UserSignupDto, InsertUserModel);
      createMap(mapper, UserModel, UserResponseDto);
    };
  }
}

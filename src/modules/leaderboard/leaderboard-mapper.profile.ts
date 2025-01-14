import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { TotalXpLeaderboardUserDto } from './dtos';
import { TotalXpLeaderboardUser } from './models';

@Injectable()
export class LeaderboardMapperProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, TotalXpLeaderboardUser, TotalXpLeaderboardUserDto);
    };
  }
}

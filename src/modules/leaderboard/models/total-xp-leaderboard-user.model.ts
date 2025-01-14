import { AutoMap } from '@automapper/classes';

export class TotalXpLeaderboardUser {
  @AutoMap()
  username: string;

  @AutoMap()
  totalXp: number;
}

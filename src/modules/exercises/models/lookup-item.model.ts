import { AutoMap } from '@automapper/classes';

export class LookupItem {
  @AutoMap()
  id: number;

  @AutoMap()
  name: string;
}

import { AutoMap } from '@automapper/classes';

export class BodyPartDto {
  @AutoMap()
  id: number;
  @AutoMap()
  name: string;
}

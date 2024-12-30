import { AutoMap } from '@automapper/classes';

export class BodyPartModel {
  @AutoMap()
  id: number;
  @AutoMap()
  name: string;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }
}

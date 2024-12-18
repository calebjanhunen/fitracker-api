import { AutoMap } from '@automapper/classes';

export class EquipmentDto {
  @AutoMap()
  id: number;
  @AutoMap()
  name: string;
}

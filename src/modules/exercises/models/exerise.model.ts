import { AutoMap } from '@automapper/classes';

export class ExerciseModel {
  @AutoMap()
  id: string;
  @AutoMap()
  name: string;
  @AutoMap()
  bodyPart: string;
  @AutoMap()
  equipment: string;
  @AutoMap()
  isCustom: boolean;
}

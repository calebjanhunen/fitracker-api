import { AutoMap } from '@automapper/classes';

export class UpdateExerciseVariationModel {
  @AutoMap()
  public name: string;

  @AutoMap()
  public notes?: string;
}

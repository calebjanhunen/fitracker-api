import { AutoMap } from '@automapper/classes';

export class ExerciseVariationModel {
  @AutoMap()
  public id: string;

  @AutoMap()
  public name: string;

  @AutoMap()
  public notes?: string;

  @AutoMap()
  public cableAttachment?: string;
}

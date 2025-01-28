import { AutoMap } from '@automapper/classes';

export class CreateExerciseVariationModel {
  @AutoMap()
  public name: string;

  @AutoMap()
  public attachmentId?: number;

  @AutoMap()
  public notes?: string;
}

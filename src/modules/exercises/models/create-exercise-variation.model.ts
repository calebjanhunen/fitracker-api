import { AutoMap } from '@automapper/classes';

export class CreateExerciseVariationModel {
  @AutoMap()
  public name: string;

  @AutoMap()
  public cableAttachmentId?: number;

  @AutoMap()
  public notes?: string;
}

import { AutoMap } from '@automapper/classes';

export class CreateWorkoutTemplateDto {
  @AutoMap()
  public name: string;
}

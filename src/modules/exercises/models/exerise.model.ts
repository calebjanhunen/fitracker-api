import { BodyPart } from 'src/common/enums/body-part.enum';

export class ExerciseModel {
  id: string;
  name: string;
  bodyPart: BodyPart;
  equipment: string;
  isCustom: boolean;
}

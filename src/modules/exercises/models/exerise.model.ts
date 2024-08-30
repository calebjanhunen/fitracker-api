export class ExerciseModel {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  isCustom: boolean;
  userId: string;

  constructor(
    id: string,
    name: string,
    bodyPart: string,
    equipment: string,
    isCustom: boolean,
    userId: string,
  ) {
    this.id = id;
    this.name = name;
    this.bodyPart = bodyPart;
    this.equipment = equipment;
    this.userId = userId;
    this.isCustom = isCustom;
  }

  public static fromDbQuery(result: any): ExerciseModel {
    return new ExerciseModel(
      result.id,
      result.name,
      result.body_part,
      result.equipment,
      result.is_custom,
      result.user_id,
    );
  }
}

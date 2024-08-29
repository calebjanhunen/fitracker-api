export class ExerciseModel {
  id: string;
  name: string;
  bodyPartId: number;
  equipmentId: number;
  isCustom: boolean;
  userId: string;

  constructor(
    id: string,
    name: string,
    bodyPartId: number,
    equipmentId: number,
    isCustom: boolean,
    userId: string,
  ) {
    this.id = id;
    this.name = name;
    this.bodyPartId = bodyPartId;
    this.equipmentId = equipmentId;
    this.userId = userId;
    this.isCustom = isCustom;
  }

  public static fromDbQuery(result: any): ExerciseModel {
    return new ExerciseModel(
      result.id,
      result.name,
      result.body_part_id,
      result.equipment_id,
      result.is_custom,
      result.user_id,
    );
  }
}

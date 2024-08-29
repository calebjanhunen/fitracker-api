export class InsertExerciseModel {
  name: string;
  bodyPartId: number;
  equipmentId: number;
  isCustom: boolean;
  userId: string;

  constructor(
    name: string,
    bodyPartId: number,
    equipmentId: number,
    userId: string,
  ) {
    this.name = name;
    this.bodyPartId = bodyPartId;
    this.equipmentId = equipmentId;
    this.userId = userId;
    this.isCustom = true;
  }
}

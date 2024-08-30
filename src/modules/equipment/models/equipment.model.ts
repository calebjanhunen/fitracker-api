export class EquipmentModel {
  id: number;
  name: string;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }

  public static fromDbQuery(result: any): EquipmentModel {
    return new EquipmentModel(result.id, result.name);
  }
}

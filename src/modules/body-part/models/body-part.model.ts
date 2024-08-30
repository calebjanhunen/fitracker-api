export class BodyPartModel {
  id: number;
  name: string;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }

  public static fromDbQuery(result: any): BodyPartModel {
    return new BodyPartModel(result.id, result.name);
  }
}

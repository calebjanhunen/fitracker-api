export class WorkoutResponse {
  public id: string;
  public name: string;
  public dateCreated: Date;
  public exercises: Exercise[];
}

class Exercise {
  public id: string;
  public name: string;
  public sets: Set[];
}

class Set {
  public weight: number;
  public reps: number;
  public rpe: number;
}

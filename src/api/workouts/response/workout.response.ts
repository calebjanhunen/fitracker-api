export class WorkoutResponse {
  public id: string;
  public name: string;
  public dateCreated: Date;
  public exercises: ExerciseResponseInWorkout[];
}

export class ExerciseResponseInWorkout {
  public id: string;
  public name: string;
  public sets: SetResponseInExercise[];
}

export class SetResponseInExercise {
  public id: string;
  public weight: number;
  public reps: number;
  public rpe: number;
}

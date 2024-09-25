export class InsertWorkoutTemplateModel {
  name: string;
  createdAt: Date;
  exercises: InsertWorkoutTemplateExerciseModel[];
}

export class InsertWorkoutTemplateExerciseModel {
  exerciseId: string;
  order: number;
  sets: InsertWorkoutTemplateSetModel[];
}

export class InsertWorkoutTemplateSetModel {
  order: number;
}

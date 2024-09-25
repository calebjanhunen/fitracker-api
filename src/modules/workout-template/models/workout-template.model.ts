export class WorkoutTemplateModel {
  name: string;
  createdAt: Date;
  exercises: WorkoutTemplateExerciseModel[];
}

export class WorkoutTemplateExerciseModel {
  exerciseId: string;
  exerciseName: string;
  order: number;
  sets: WorkoutTemplateSetModel[];
}

export class WorkoutTemplateSetModel {
  id: string;
  order: number;
}

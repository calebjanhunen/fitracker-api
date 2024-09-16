export class RecentSetsForExerciseModel {
  id: string;
  recentSets: RecentSetModel[];
}

export class RecentSetModel {
  id: string;
  weight: number;
  reps: number;
  rpe: number;
}

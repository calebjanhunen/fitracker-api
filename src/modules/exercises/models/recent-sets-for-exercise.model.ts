import { AutoMap } from '@automapper/classes';

export class RecentSetsForExerciseModel {
  id: string;
  recentSets: RecentSetModel[];
}

export class RecentSetModel {
  @AutoMap()
  id: string;

  @AutoMap()
  weight: number;

  @AutoMap()
  reps: number;

  @AutoMap()
  rpe?: number;
}

import { WorkoutTemplateResponseSetDto } from './workout-template-response.dto';

export class WorkoutTemplateWithRecentSetsResponseDto {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  exercises: WorkoutTemplateExerciseWithRecentSetsDto[];
}

export class WorkoutTemplateExerciseWithRecentSetsDto {
  id: string;
  name: string;
  order: number;
  sets: WorkoutTemplateResponseSetDto[];
  previousSets: SetDto[];
}

export class SetDto {
  weight: number;
  reps: number;
  rpe: number;
  order: number;
}

import { Set } from 'src/modules/workouts/models/set.entity';
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
  exerciseId: string;
  name: string;
  order: number;
  sets: WorkoutTemplateResponseSetDto[];
  previousSets: Set[];
}

import { SetType } from 'src/common/enums/set-type.enum';

export class WorkoutTemplateResponseDto {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  exercises: WorkoutTemplateReponseExerciseDto[];
}

export class WorkoutTemplateReponseExerciseDto {
  id: string;
  exerciseId: string;
  name: string;
  order: number;
  sets: WorkoutTemplateResponseSetDto[];
}

export class WorkoutTemplateResponseSetDto {
  id: string;
  order: number;
  setType: SetType;
}

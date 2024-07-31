import { WorkoutExercise } from 'src/modules/workouts/models/workout-exercises.entity';
import {
  WorkoutTemplateExerciseWithRecentSetsDto,
  WorkoutTemplateWithRecentSetsResponseDto,
} from '../dto/workout-template-with-recent-sets-response.dto';
import { WorkoutTemplate } from '../models/workout-template.entity';

export class WorkoutTemplateWithRecentSetsMapper {
  public static fromEntityToDto(
    entity: WorkoutTemplate,
    recentSets: WorkoutExercise[],
  ): WorkoutTemplateWithRecentSetsResponseDto {
    const response = new WorkoutTemplateWithRecentSetsResponseDto();
    response.id = entity.id;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    response.name = entity.name;

    const exercises: WorkoutTemplateExerciseWithRecentSetsDto[] =
      entity.workoutTemplateExercises.map((wte) => ({
        id: wte.id,
        exerciseId: wte.exercise.id,
        order: wte.order,
        name: wte.exercise.name,
        sets: wte.sets.map((set) => ({
          order: set.order,
          setType: set.type,
        })),
        previousSets:
          recentSets.find((we) => we.exercise.id === wte.exercise.id)?.sets ??
          [],
      }));
    response.exercises = exercises;

    return response;
  }
}

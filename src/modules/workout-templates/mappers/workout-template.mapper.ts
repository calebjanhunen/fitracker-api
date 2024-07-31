import { Exercise } from 'src/modules/exercises/models/exercise.entity';
import { User } from 'src/modules/user/models/user.entity';
import { CreateWorkoutTemplateDto } from '../dto/create-workout-template.dto';
import {
  WorkoutTemplateReponseExerciseDto,
  WorkoutTemplateResponseDto,
} from '../dto/workout-template-response.dto';
import { WorkoutTemplateExercise } from '../models/workout-template-exercise.entity';
import { WorkoutTemplateSet } from '../models/workout-template-set.entity';
import { WorkoutTemplate } from '../models/workout-template.entity';

export class WorkoutTemplateMapper {
  public static fromDtoToEntity(
    dto: CreateWorkoutTemplateDto,
    exercises: Exercise[],
    user: User,
  ): WorkoutTemplate {
    const workoutTemplate = new WorkoutTemplate();
    workoutTemplate.name = dto.name;
    workoutTemplate.user = user;

    workoutTemplate.workoutTemplateExercises = dto.exercises.map((e) => {
      const workoutTemplateExercise = new WorkoutTemplateExercise();
      const foundExercise = exercises.find((ex) => ex.id === e.id);
      if (!foundExercise) throw new Error(`Exercise with ${e.id} not found`);

      workoutTemplateExercise.exercise = foundExercise;
      workoutTemplateExercise.workoutTemplate = workoutTemplate;
      workoutTemplateExercise.order = e.order;
      workoutTemplateExercise.sets = e.sets.map((set) => {
        const setEntity = new WorkoutTemplateSet();
        setEntity.order = set.order;
        setEntity.type = set.setType;
        setEntity.workoutTemplateExercise = workoutTemplateExercise;
        return setEntity;
      });
      return workoutTemplateExercise;
    });

    return workoutTemplate;
  }

  public static fromEntityToDto(
    entity: WorkoutTemplate,
  ): WorkoutTemplateResponseDto {
    const response = new WorkoutTemplateResponseDto();
    response.id = entity.id;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    response.name = entity.name;

    const exercises: WorkoutTemplateReponseExerciseDto[] =
      entity.workoutTemplateExercises.map((wte) => ({
        id: wte.id,
        exerciseId: wte.exercise.id,
        order: wte.order,
        name: wte.exercise.name,
        sets: wte.sets.map((set) => ({
          order: set.order,
          setType: set.type,
        })),
      }));
    response.exercises = exercises;

    return response;
  }
}

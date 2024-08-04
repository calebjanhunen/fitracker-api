import { Exercise } from 'src/modules/exercises/models/exercise.entity';
import { User } from 'src/modules/user/models/user.entity';
import { WorkoutTemplateRequestDto } from '../dto/workout-template-request.dto';
import {
  WorkoutTemplateReponseExerciseDto,
  WorkoutTemplateResponseDto,
} from '../dto/workout-template-response.dto';
import { WorkoutTemplateExercise } from '../models/workout-template-exercise.entity';
import { WorkoutTemplateSet } from '../models/workout-template-set.entity';
import { WorkoutTemplate } from '../models/workout-template.entity';

export class WorkoutTemplateMapper {
  public static fromDtoToEntity(
    dto: WorkoutTemplateRequestDto,
    user: User,
    workoutTemplateId?: string,
  ): WorkoutTemplate {
    const workoutTemplate = new WorkoutTemplate();
    if (workoutTemplateId) workoutTemplate.id = workoutTemplateId;
    workoutTemplate.name = dto.name;
    workoutTemplate.user = user;

    workoutTemplate.workoutTemplateExercises = dto.exercises.map(
      (workoutTemplateExerciseDto) => {
        const workoutTemplateExerciseEntity = new WorkoutTemplateExercise();
        const exerciseEntity = new Exercise();
        exerciseEntity.id = workoutTemplateExerciseDto.exerciseId;

        if (workoutTemplateExerciseDto.id)
          workoutTemplateExerciseEntity.id = workoutTemplateExerciseDto.id;
        workoutTemplateExerciseEntity.exercise = exerciseEntity;
        workoutTemplateExerciseEntity.workoutTemplate = workoutTemplate;
        workoutTemplateExerciseEntity.order = workoutTemplateExerciseDto.order;
        workoutTemplateExerciseEntity.sets =
          workoutTemplateExerciseDto.sets.map((setDto) => {
            const setEntity = new WorkoutTemplateSet();
            if (setDto.id) setEntity.id = setDto.id;
            setEntity.order = setDto.order;
            setEntity.type = setDto.setType;
            setEntity.workoutTemplateExercise = workoutTemplateExerciseEntity;
            return setEntity;
          });
        return workoutTemplateExerciseEntity;
      },
    );

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
          id: set.id,
          order: set.order,
          setType: set.type,
        })),
      }));
    response.exercises = exercises;

    return response;
  }
}

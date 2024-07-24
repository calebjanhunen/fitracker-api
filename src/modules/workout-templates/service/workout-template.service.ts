import { Injectable } from '@nestjs/common';
import ExercisesService from 'src/modules/exercises/services/exercises.service';
import { UserService } from 'src/modules/user/service/user.service';
import { CreateWorkoutTemplateDto } from '../dto/create-workout-template.dto';
import { WorkoutTemplateResponseDto } from '../dto/workout-template-response.dto';
import { WorkoutTemplateMapper } from '../mappers/workout-template.mapper';
import { WorkoutTemplate } from '../models/workout-template.entity';
import { WorkoutTemplateRepository } from '../repository/workout-template.repository';

@Injectable()
export class WorkoutTemplateService {
  constructor(
    private workoutTemplateRepo: WorkoutTemplateRepository,
    private exerciseService: ExercisesService,
    private userService: UserService,
  ) {}

  public async saveWorkoutTemplate(
    workoutTemplateDto: CreateWorkoutTemplateDto,
    userId: string,
  ): Promise<WorkoutTemplateResponseDto> {
    const user = await this.userService.getById(userId);

    const exerciseIds = workoutTemplateDto.exercises.map((e) => e.id);
    const exercises = await this.exerciseService.validateExercisesExist(
      exerciseIds,
      user,
    );

    const workoutTemplateEntity = WorkoutTemplateMapper.fromDtoToEntity(
      workoutTemplateDto,
      exercises,
      user,
    );

    const createdWorkoutTemplate = await this.workoutTemplateRepo.save(
      workoutTemplateEntity,
    );

    return WorkoutTemplateMapper.fromEntityToDto(createdWorkoutTemplate);
  }
}

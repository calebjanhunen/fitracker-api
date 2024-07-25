import { Injectable } from '@nestjs/common';
import ExercisesService from 'src/modules/exercises/services/exercises.service';
import { UserService } from 'src/modules/user/service/user.service';
import { CreateWorkoutTemplateDto } from '../dto/create-workout-template.dto';
import { WorkoutTemplateResponseDto } from '../dto/workout-template-response.dto';
import { WorkoutTemplateMapper } from '../mappers/workout-template.mapper';
import { WorkoutTemplateRepository } from '../repository/workout-template.repository';
import { WorkoutTemplateNotFoundException } from './exceptions/workout-template-not-found.exception';

@Injectable()
export class WorkoutTemplateService {
  constructor(
    private workoutTemplateRepo: WorkoutTemplateRepository,
    private exerciseService: ExercisesService,
    private userService: UserService,
  ) {}

  /**
   * Creates a workout template for a given user
   * @param {CreateWorkoutTemplateDto} workoutTemplateDto
   * @param {string} userId
   * @returns {WorkoutTemplateResponseDto}
   */
  public async createWorkoutTemplate(
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

  /**
   * Gets a workout template using the id and user id
   *
   * @param {string} id
   * @param {string} userId
   * @returns {WorkoutTemplateResponseDto}
   *
   * @throws {ResourceNotFoundException}
   * @throws {WorkoutTemplateNotFoundException}
   */
  public async getSingleWorkoutTemplate(
    id: string,
    userId: string,
  ): Promise<WorkoutTemplateResponseDto> {
    await this.userService.getById(userId);

    const workoutTemplate = await this.workoutTemplateRepo.findById(id, userId);

    if (!workoutTemplate) throw new WorkoutTemplateNotFoundException(id);

    return WorkoutTemplateMapper.fromEntityToDto(workoutTemplate);
  }

  /**
   * Gets all workout templates for a given user
   * @param {string} userId
   * @returns {WorkoutTemplateResponseDto[]}
   *
   * @throws {ResourceNotFoundException}
   */
  public async getAllWorkoutTemplates(
    userId: string,
  ): Promise<WorkoutTemplateResponseDto[]> {
    await this.userService.getById(userId);
    const workoutTemplates = await this.workoutTemplateRepo.findMany(userId);
    return workoutTemplates.map((wt) =>
      WorkoutTemplateMapper.fromEntityToDto(wt),
    );
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { SetType } from 'src/common/enums/set-type.enum';
import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { Exercise } from 'src/modules/exercises/models/exercise.entity';
import ExercisesService from 'src/modules/exercises/services/exercise.service';
import { User } from 'src/modules/user/models/user.entity';
import { UserService } from 'src/modules/user/service/user.service';
import {
  WorkoutTemplateRequestDto,
  WorkoutTemplateRequestExerciseDto,
  WorkoutTemplateRequestSetDto,
} from '../../dto/workout-template-request.dto';
import { WorkoutTemplateMapper } from '../../mappers/workout-template.mapper';
import { WorkoutTemplateExercise } from '../../models/workout-template-exercise.entity';
import { WorkoutTemplate } from '../../models/workout-template.entity';
import { WorkoutTemplateRepository } from '../../repository/workout-template.repository';
import { CouldNotUpdateWorkoutTemplateException } from '../exceptions/could-not-update-workout-template.exception';
import { InvalidOrderException } from '../exceptions/invalid-order.exception';
import { WorkoutTemplateNotFoundException } from '../exceptions/workout-template-not-found.exception';
import { WorkoutTemplateService } from '../workout-template.service';

describe('Workout Template Service: updateWorkoutTemplate', () => {
  let mockWorkoutTemplateRepo: jest.Mocked<WorkoutTemplateRepository>;
  let mockExerciseService: jest.Mocked<ExercisesService>;
  let mockUserService: jest.Mocked<UserService>;
  let workoutTemplateService: WorkoutTemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutTemplateService,
        {
          provide: WorkoutTemplateRepository,
          useValue: { findById: jest.fn(), update: jest.fn() },
        },
        {
          provide: UserService,
          useValue: { getById: jest.fn() },
        },
        {
          provide: ExercisesService,
          useValue: { validateExercisesExist: jest.fn() },
        },
      ],
    }).compile();

    workoutTemplateService = module.get(WorkoutTemplateService);
    mockWorkoutTemplateRepo = module.get(WorkoutTemplateRepository);
    mockUserService = module.get(UserService);
    mockExerciseService = module.get(ExercisesService);
  });

  it('should be defined', () => {
    expect(workoutTemplateService).toBeDefined();
    expect(mockWorkoutTemplateRepo).toBeDefined();
    expect(mockUserService).toBeDefined();
    expect(mockExerciseService).toBeDefined();
  });

  it('should return workout template on success', async () => {
    const user = new User();
    user.id = 'user-id';
    const dto = getWorkoutTemplateDto();
    const updatedWT = getWorkoutTemplateEntity();

    // Arrange
    mockUserService.getById.mockResolvedValue(user);
    mockWorkoutTemplateRepo.findById.mockResolvedValue(new WorkoutTemplate());
    mockExerciseService.validateExercisesExist.mockResolvedValue([
      new Exercise(),
    ]);
    mockWorkoutTemplateRepo.update.mockResolvedValue(updatedWT);

    // Act
    const updatedWorkoutTemplateDto =
      await workoutTemplateService.updateWorkoutTemplate(
        'workout-template-id',
        dto,
        user.id,
      );

    // Assert
    expect(mockUserService.getById).toHaveBeenCalledWith('user-id');
    expect(mockWorkoutTemplateRepo.findById).toHaveBeenCalledWith(
      'workout-template-id',
      'user-id',
    );
    expect(mockExerciseService.validateExercisesExist).toHaveBeenCalledWith(
      ['exercise-id'],
      user,
    );
    expect(mockWorkoutTemplateRepo.update).toHaveBeenCalledWith(
      WorkoutTemplateMapper.fromDtoToEntity(dto, user, 'workout-template-id'),
      expect.any(WorkoutTemplate),
      user.id,
    );
    expect(updatedWorkoutTemplateDto.name).toBe('Updated Workout Template');
    expect(updatedWorkoutTemplateDto.id).toBe('workout-template-id');
  });
  it('should throw ResourceNotFoundException if user not found', async () => {
    const userId = 'user-id';
    const workoutTemplateDto = getWorkoutTemplateDto();
    const workoutTemplateId = 'workout-template-id';

    mockUserService.getById.mockRejectedValue(
      new ResourceNotFoundException('user not found'),
    );

    await expect(
      workoutTemplateService.updateWorkoutTemplate(
        workoutTemplateId,
        workoutTemplateDto,
        userId,
      ),
    ).rejects.toThrow(ResourceNotFoundException);
    expect(mockUserService.getById).toHaveBeenCalledWith(userId);
  });
  it('should throw WorkoutTemplateNotFoundException if workout template does not exist', async () => {
    const user = new User();
    user.id = 'user-id';
    const workoutTemplateDto = getWorkoutTemplateDto();
    const workoutTemplateId = 'workout-template-id';

    mockUserService.getById.mockResolvedValue(user);
    mockWorkoutTemplateRepo.findById.mockRejectedValue(
      new WorkoutTemplateNotFoundException(workoutTemplateId),
    );

    await expect(
      workoutTemplateService.updateWorkoutTemplate(
        workoutTemplateId,
        workoutTemplateDto,
        user.id,
      ),
    ).rejects.toThrow(WorkoutTemplateNotFoundException);
    expect(mockUserService.getById).toHaveBeenCalledWith(user.id);
    expect(mockWorkoutTemplateRepo.findById).toHaveBeenCalledWith(
      workoutTemplateId,
      user.id,
    );
  });
  it('should throw Error if validating exercises fails', async () => {
    const user = new User();
    user.id = 'user-id';
    const workoutTemplateDto = getWorkoutTemplateDto();
    const workoutTemplateId = 'workout-template-id';

    mockUserService.getById.mockResolvedValue(user);
    mockWorkoutTemplateRepo.findById.mockResolvedValue(new WorkoutTemplate());
    mockExerciseService.validateExercisesExist.mockRejectedValue(new Error());

    await expect(
      workoutTemplateService.updateWorkoutTemplate(
        workoutTemplateId,
        workoutTemplateDto,
        user.id,
      ),
    ).rejects.toThrow(Error);
    expect(mockUserService.getById).toHaveBeenCalledWith(user.id);
    expect(mockWorkoutTemplateRepo.findById).toHaveBeenCalledWith(
      workoutTemplateId,
      user.id,
    );
    expect(mockExerciseService.validateExercisesExist).toHaveBeenCalledWith(
      ['exercise-id'],
      user,
    );
  });
  it('should throw InvalidOrderException if order of exercises is not sequential', async () => {
    const user = new User();
    user.id = 'user-id';
    const workoutTemplateDto = getWorkoutTemplateDto();
    const workoutTemplateId = 'workout-template-id';
    workoutTemplateDto.exercises[0].order = 2;

    mockUserService.getById.mockResolvedValue(user);
    mockWorkoutTemplateRepo.findById.mockResolvedValue(new WorkoutTemplate());
    mockExerciseService.validateExercisesExist.mockResolvedValue([
      new Exercise(),
    ]);

    await expect(
      workoutTemplateService.updateWorkoutTemplate(
        workoutTemplateId,
        workoutTemplateDto,
        user.id,
      ),
    ).rejects.toThrow(InvalidOrderException);
  });
  it('should throw InvalidOrderException if order of sets is not sequential', async () => {
    const user = new User();
    user.id = 'user-id';
    const workoutTemplateDto = getWorkoutTemplateDto();
    const workoutTemplateId = 'workout-template-id';

    const set1 = new WorkoutTemplateRequestSetDto();
    set1.id = 'set1-id';
    set1.order = 1;
    set1.setType = SetType.WARMUP;
    const set2 = new WorkoutTemplateRequestSetDto();
    set1.id = 'set2-id';
    set1.order = 3;
    set1.setType = SetType.WARMUP;
    workoutTemplateDto.exercises[0].sets = [set1, set2];

    mockUserService.getById.mockResolvedValue(user);
    mockWorkoutTemplateRepo.findById.mockResolvedValue(new WorkoutTemplate());
    mockExerciseService.validateExercisesExist.mockResolvedValue([
      new Exercise(),
    ]);

    await expect(
      workoutTemplateService.updateWorkoutTemplate(
        workoutTemplateId,
        workoutTemplateDto,
        user.id,
      ),
    ).rejects.toThrow(InvalidOrderException);
  });
  it('should throw CouldNotUpdateWorkoutTemplateException on updating error', async () => {
    const user = new User();
    user.id = 'user-id';
    const workoutTemplateDto = getWorkoutTemplateDto();
    const workoutTemplateId = 'workout-template-id';

    mockUserService.getById.mockResolvedValue(user);
    mockWorkoutTemplateRepo.findById.mockResolvedValue(new WorkoutTemplate());
    mockExerciseService.validateExercisesExist.mockResolvedValue([
      new Exercise(),
    ]);
    mockWorkoutTemplateRepo.update.mockRejectedValue(new Error());

    await expect(
      workoutTemplateService.updateWorkoutTemplate(
        workoutTemplateId,
        workoutTemplateDto,
        user.id,
      ),
    ).rejects.toThrow(CouldNotUpdateWorkoutTemplateException);
    expect(mockUserService.getById).toHaveBeenCalledWith(user.id);
    expect(mockWorkoutTemplateRepo.findById).toHaveBeenCalledWith(
      workoutTemplateId,
      user.id,
    );
    expect(mockExerciseService.validateExercisesExist).toHaveBeenCalledWith(
      ['exercise-id'],
      user,
    );
    expect(mockWorkoutTemplateRepo.update).toHaveBeenCalledWith(
      WorkoutTemplateMapper.fromDtoToEntity(
        workoutTemplateDto,
        user,
        workoutTemplateId,
      ),
      expect.any(WorkoutTemplate),
      user.id,
    );
  });
  it('should throw WorkoutTemplateNotFoundException if workout template not found after updating', async () => {
    const user = new User();
    user.id = 'user-id';
    const workoutTemplateDto = getWorkoutTemplateDto();
    const workoutTemplateId = 'workout-template-id';

    mockUserService.getById.mockResolvedValue(user);
    mockWorkoutTemplateRepo.findById.mockResolvedValue(new WorkoutTemplate());
    mockExerciseService.validateExercisesExist.mockResolvedValue([
      new Exercise(),
    ]);
    mockWorkoutTemplateRepo.update.mockResolvedValue(null);

    await expect(
      workoutTemplateService.updateWorkoutTemplate(
        workoutTemplateId,
        workoutTemplateDto,
        user.id,
      ),
    ).rejects.toThrow(WorkoutTemplateNotFoundException);
    expect(mockUserService.getById).toHaveBeenCalledWith(user.id);
    expect(mockWorkoutTemplateRepo.findById).toHaveBeenCalledWith(
      workoutTemplateId,
      user.id,
    );
    expect(mockExerciseService.validateExercisesExist).toHaveBeenCalledWith(
      ['exercise-id'],
      user,
    );
    expect(mockWorkoutTemplateRepo.update).toHaveBeenCalledWith(
      WorkoutTemplateMapper.fromDtoToEntity(
        workoutTemplateDto,
        user,
        workoutTemplateId,
      ),
      expect.any(WorkoutTemplate),
      user.id,
    );
  });
});

function getWorkoutTemplateDto(): WorkoutTemplateRequestDto {
  const dto = new WorkoutTemplateRequestDto();
  dto.name = 'Updated Workout Template';
  dto.exercises = [];
  const exerciseDto = new WorkoutTemplateRequestExerciseDto();
  exerciseDto.id = 'workout-template-exercise-id';
  exerciseDto.exerciseId = 'exercise-id';
  exerciseDto.order = 1;
  exerciseDto.sets = [];
  dto.exercises.push(exerciseDto);
  return dto;
}

function getWorkoutTemplateEntity(): WorkoutTemplate {
  const entity = new WorkoutTemplate();
  entity.id = 'workout-template-id';
  entity.name = 'Updated Workout Template';
  entity.workoutTemplateExercises = [];
  const workoutTemplateExercise = new WorkoutTemplateExercise();
  workoutTemplateExercise.exercise = new Exercise();
  workoutTemplateExercise.id = 'workout-template-exercise-id';
  workoutTemplateExercise.order = 1;
  workoutTemplateExercise.sets = [];
  return entity;
}

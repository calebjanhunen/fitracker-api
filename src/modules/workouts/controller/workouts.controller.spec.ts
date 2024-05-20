import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { UserNotFoundException } from 'src/common/http-exceptions/user-not-found.exception';
import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { Exercise, Set, User, Workout } from 'src/model';
import { ExerciseDoesNotBelongToUser } from 'src/modules/exercises/services/exceptions/exercise-does-not-belong-to-user.exception';
import { ExerciseNotFoundException } from 'src/modules/exercises/services/exceptions/exercise-not-found.exception';
import { UserService } from 'src/modules/user/service/user.service';
import {
  CreateWorkoutRequestDTO,
  ExerciseDTO,
  SetDTO,
} from '../dtos/create-workout-request.dto';
import {
  ExerciseResponseDTO,
  SetResponseDTO,
  WorkoutResponseDTO,
} from '../dtos/create-workout-response.dto';
import { fromWorkoutEntityToDTO } from '../helpers/from-entity-to-dto.helper';
import { CouldNotSaveSetException } from '../internal-errors/could-not-save-set.exception';
import { CouldNotSaveWorkoutException } from '../internal-errors/could-not-save-workout.exception';
import { WorkoutNotFoundException } from '../internal-errors/workout-not-found.exception';
import { WorkoutsService } from '../service/workouts.service';
import { CouldNotFindWorkoutException } from './exceptions/could-not-find-workout.exception';
import { WorkoutsController } from './workouts.controller';

describe('WorkoutsController', () => {
  let workoutsController: WorkoutsController;
  let mockWorkoutsService: WorkoutsService;
  let mockUserService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkoutsController],
      providers: [
        AuthGuard,
        JwtService,
        {
          provide: WorkoutsService,
          useValue: {
            createWorkout: jest.fn(),
            // getWorkouts: jest.fn(),
            getById: jest.fn(),
            // deleteById: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            getById: jest.fn(),
          },
        },
      ],
    }).compile();

    workoutsController = module.get<WorkoutsController>(WorkoutsController);
    mockWorkoutsService = module.get<WorkoutsService>(WorkoutsService);
    mockUserService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(workoutsController).toBeDefined();
    expect(mockWorkoutsService).toBeDefined();
    expect(mockUserService).toBeDefined();
  });

  // describe('test createWorkout()', () => {
  //   it('should return workout when it successfully creates workout', async () => {
  //     const createWorkoutDTO = getMockWorkoutDTO();
  //     createWorkoutDTO.exercises.push(getMockExerciseDTO());
  //     createWorkoutDTO.exercises[0].sets.push(getMockSetDTO(1, 1, 1));

  //     jest
  //       .spyOn(mockWorkoutsService, 'createWorkout')
  //       .mockResolvedValue(new Workout());

  //     const response = await workoutsController.create(
  //       createWorkoutDTO,
  //       'test-user',
  //     );

  //     expect(response).toStrictEqual(new WorkoutResponseDTO());
  //   });
  //   it('should throw ForbiddenException if an exercise in the workout does not belong to the user', async () => {
  //     const createWorkoutDTO = getMockWorkoutDTO();

  //     jest
  //       .spyOn(mockWorkoutsService, 'createWorkout')
  //       .mockRejectedValue(new ExerciseDoesNotBelongToUser());

  //     await expect(() =>
  //       workoutsController.create(createWorkoutDTO, 'test-user'),
  //     ).rejects.toThrow(ForbiddenException);
  //   });
  //   it('should throw NotFoundException if an exercise in the workout could not be found', async () => {
  //     const createWorkoutDTO = getMockWorkoutDTO();

  //     jest
  //       .spyOn(mockWorkoutsService, 'createWorkout')
  //       .mockRejectedValue(new ExerciseNotFoundException());

  //     await expect(() =>
  //       workoutsController.create(createWorkoutDTO, 'test-user'),
  //     ).rejects.toThrow(NotFoundException);
  //   });
  //   it('should throw NotFoundException if the workout could not be found after creation', async () => {
  //     const createWorkoutDTO = getMockWorkoutDTO();

  //     jest
  //       .spyOn(mockWorkoutsService, 'createWorkout')
  //       .mockRejectedValue(new WorkoutNotFoundException());

  //     await expect(() =>
  //       workoutsController.create(createWorkoutDTO, 'test-user'),
  //     ).rejects.toThrow(NotFoundException);
  //   });
  //   it('should throw ConflictException if a set in the workout could not be saved', async () => {
  //     const createWorkoutDTO = getMockWorkoutDTO();

  //     jest
  //       .spyOn(mockWorkoutsService, 'createWorkout')
  //       .mockRejectedValue(new CouldNotSaveSetException());

  //     await expect(() =>
  //       workoutsController.create(createWorkoutDTO, 'test-user'),
  //     ).rejects.toThrow(ConflictException);
  //   });
  //   it('should throw ConflictException if the workout could not be saved', async () => {
  //     const createWorkoutDTO = getMockWorkoutDTO();

  //     jest
  //       .spyOn(mockWorkoutsService, 'createWorkout')
  //       .mockRejectedValue(new CouldNotSaveWorkoutException('Workout Name'));

  //     await expect(() =>
  //       workoutsController.create(createWorkoutDTO, 'test-user'),
  //     ).rejects.toThrow(ConflictException);
  //   });
  // });

  //   describe('test getWorkouts()', () => {
  //     it('should return a list of workouts', async () => {
  //       const user = new User();
  //       user.id = 'user-id';
  //       const workoutModel = getWorkoutModelWithExercisesAndSets(user);
  //       const workoutResponse = getWorkoutResponse(workoutModel);

  //       jest.spyOn(mockUserService, 'getById').mockResolvedValue(user);
  //       jest
  //         .spyOn(mockWorkoutsService, 'getWorkouts')
  //         .mockResolvedValue([workoutModel]);
  //       jest
  //         .spyOn(mockWorkoutResponseAdapter, 'fromEntityToResponse')
  //         .mockReturnValue(workoutResponse);

  //       const result = await workoutsController.getWorkouts(user.id);

  //       expect(result).toStrictEqual([workoutResponse]);
  //     });

  //     it('should throw NotFoundException if user is not found', () => {
  //       const user = new User();
  //       user.id = 'user-id';

  //       jest
  //         .spyOn(mockUserService, 'getById')
  //         .mockRejectedValue(new ImATeapotException());

  //       expect(mockUserService.getById).rejects.toThrow(ImATeapotException);
  //       expect(
  //         async () => await workoutsController.getWorkouts(user.id),
  //       ).rejects.toThrow(NotFoundException);
  //     });
  //   });

  //   describe('test getSingleWorkout()', () => {
  //     it('should successfully return workout', async () => {
  //       const user = new User();
  //       user.id = 'user-id';
  //       const workoutModel = getWorkoutModelWithExercisesAndSets(user);
  //       const workoutResponse = getWorkoutResponse(workoutModel);

  //       jest.spyOn(mockUserService, 'getById').mockResolvedValue(user);
  //       jest
  //         .spyOn(mockWorkoutsService, 'getById')
  //         .mockResolvedValue(workoutModel);
  //       jest
  //         .spyOn(mockWorkoutResponseAdapter, 'fromEntityToResponse')
  //         .mockReturnValue(workoutResponse);

  //       const response = await workoutsController.getSingleWorkout('test-user', {
  //         id: 'test-workout-id',
  //       });

  //       expect(response).toStrictEqual(workoutResponse);
  //     });
  //     it('should throw UserNotFoundException when user is not found', () => {
  //       jest
  //         .spyOn(mockUserService, 'getById')
  //         .mockRejectedValue(new UserNotFoundException());

  //       expect(
  //         async () =>
  //           await workoutsController.getSingleWorkout('test-user', {
  //             id: 'test-workout-id',
  //           }),
  //       ).rejects.toThrow(UserNotFoundException);
  //     });
  //     it('should throw CouldNotFindWorkoutException if workout is not found', () => {
  //       const user = new User();
  //       user.id = 'user-id';

  //       jest.spyOn(mockUserService, 'getById').mockResolvedValue(user);
  //       jest
  //         .spyOn(mockWorkoutsService, 'getById')
  //         .mockRejectedValue(new CouldNotFindWorkoutException());

  //       expect(
  //         async () =>
  //           await workoutsController.getSingleWorkout('test-user', {
  //             id: 'test-workout-id',
  //           }),
  //       ).rejects.toThrow(CouldNotFindWorkoutException);
  //     });
  //   });

  //   describe('test deleteWorkout()', () => {
  //     it('should return no content when delete is successful', async () => {
  //       jest.spyOn(mockWorkoutsService, 'deleteById').mockResolvedValue();

  //       await workoutsController.deleteWorkout('user-id', 'workout-id');

  //       expect(mockWorkoutsService.deleteById).toHaveBeenCalledTimes(1);
  //       expect(mockWorkoutsService.deleteById).toHaveBeenCalledWith(
  //         'workout-id',
  //         'user-id',
  //       );
  //     });
  //     it('should throw NotFoundException when workout is not found', () => {
  //       jest
  //         .spyOn(mockWorkoutsService, 'deleteById')
  //         .mockRejectedValue(new ResourceNotFoundException('Workout not found'));

  //       expect(
  //         async () =>
  //           await workoutsController.deleteWorkout('user-id', 'workout-id'),
  //       ).rejects.toThrow(NotFoundException);
  //     });
  //   });
});

// function getMockUser(): User {
//   const user = new User();
//   user.id = 'user-id';
//   return user;
// }

function getMockWorkoutDTO(): CreateWorkoutRequestDTO {
  const workoutDTO = new CreateWorkoutRequestDTO();
  workoutDTO.name = 'Test Workout';
  workoutDTO.exercises = [];
  return workoutDTO;
}

function getMockExerciseDTO(): ExerciseDTO {
  const exerciseDTO = new ExerciseDTO();
  exerciseDTO.id = 'exercise-id';
  exerciseDTO.sets = [];
  return exerciseDTO;
}

function getMockSetDTO(weight: number, reps: number, rpe: number): SetDTO {
  const setDTO = new SetDTO();
  setDTO.reps = reps;
  setDTO.rpe = rpe;
  setDTO.weight = weight;
  return setDTO;
}

function getMockWorkoutResponseDTO(): WorkoutResponseDTO {
  const responseDTO = new WorkoutResponseDTO();
  responseDTO.exercises = [getMockExerciseResponseDTO()];
  return responseDTO;
}

function getMockExerciseResponseDTO(): ExerciseResponseDTO {
  const exercise = new ExerciseResponseDTO();
  exercise.id = 'exercise-id';
  exercise.name = 'Test Exercise';
  exercise.sets = [getMockSetResponseDTO()];
  return exercise;
}

function getMockSetResponseDTO(): SetResponseDTO {
  const set = new SetResponseDTO();
  set.id = '123';
  set.reps = 12;
  set.rpe = 1;
  set.weight = 123;
  return set;
}

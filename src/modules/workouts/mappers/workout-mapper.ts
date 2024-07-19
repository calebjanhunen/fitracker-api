import { Exercise } from 'src/model';
import { User } from 'src/modules/user/models/user.entity';
import { CreateWorkoutRequestDTO } from '../dtos/create-workout-request.dto';
import {
  ExerciseInWorkoutResponseDto,
  WorkoutResponseDto,
} from '../dtos/workout-response.dto';
import { Set } from '../models/set.entity';
import { WorkoutExercise } from '../models/workout-exercises.entity';
import { Workout } from '../models/workout.entity';

export class WorkoutMapper {
  public static fromDtoToEntity(
    workoutDto: CreateWorkoutRequestDTO,
    exercises: Exercise[],
    user: User,
  ): Workout {
    const workout = new Workout();
    workout.name = workoutDto.name;
    workout.user = user;
    workout.workoutExercises = workoutDto.exercises.map((e) => {
      const workoutExercise = new WorkoutExercise();

      // Get exercise from list of exercises from parameter
      const foundExercise = exercises.find((ex) => ex.id === e.id);
      if (!foundExercise) throw new Error(`Exercise with ${e.id} not found`);

      workoutExercise.exercise = foundExercise;
      workoutExercise.workout = workout;
      workoutExercise.sets = e.sets.map((set) => {
        const setEntity = new Set();
        setEntity.reps = set.reps;
        setEntity.weight = set.weight;
        setEntity.rpe = set.rpe;
        setEntity.setOrder = set.setOrder;
        setEntity.workoutExercise = workoutExercise;
        return setEntity;
      });
      return workoutExercise;
    });

    return workout;
  }

  public static fromEntityToDto(workout: Workout): WorkoutResponseDto {
    const response = new WorkoutResponseDto();
    response.id = workout.id;
    response.createdAt = workout.createdAt;
    response.updatedAt = workout.updatedAt;
    response.name = workout.name;

    const exercises: ExerciseInWorkoutResponseDto[] =
      workout.workoutExercises.map((we) => ({
        id: we.exercise.id,
        name: we.exercise.name,
        sets: we.sets.map((set) => ({
          setOrder: set.setOrder,
          reps: set.reps,
          weight: set.weight,
          rpe: set.rpe,
        })),
      }));
    response.exercises = exercises;

    return response;
  }
}

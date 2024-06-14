import { Workout } from 'src/model';
import {
  ExerciseInWorkoutResponseDto,
  WorkoutResponseDto,
} from '../dtos/workout-response.dto';

export class WorkoutTransformer {
  public static toResponseDto(workout: Workout): WorkoutResponseDto {
    const response = new WorkoutResponseDto();
    response.id = workout.id;
    response.createdAt = workout.createdAt;
    response.updatedAt = workout.updatedAt;
    response.name = workout.name;

    const exercises: ExerciseInWorkoutResponseDto[] =
      workout.workoutExercise.map((we) => ({
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

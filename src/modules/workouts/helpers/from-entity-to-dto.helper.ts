import { Workout } from 'src/model';
import {
  ExerciseResponseDTO,
  SetResponseDTO,
  WorkoutResponseDTO,
} from 'src/modules/workouts/dtos/create-workout-response.dto';

export function fromWorkoutEntityToDTO(workout: Workout): WorkoutResponseDTO {
  const response = new WorkoutResponseDTO();
  response.name = workout.name;
  response.id = workout.id;
  response.createdAt = workout.createdAt;
  response.updatedAt = workout.updatedAt;
  response.exercises = [];

  for (const workoutExercise of workout.workoutExercise) {
    const exerciseDTO = new ExerciseResponseDTO();
    exerciseDTO.sets = [];
    exerciseDTO.id = workoutExercise.exercise.id;
    exerciseDTO.name = workoutExercise.exercise.name;

    for (const set of workoutExercise.sets) {
      const setDTO = new SetResponseDTO();
      setDTO.id = set.id;
      setDTO.reps = set.reps;
      setDTO.weight = set.weight;
      setDTO.rpe = set.rpe;
      setDTO.setOrder = set.setOrder;
      exerciseDTO.sets.push(setDTO);
    }
    response.exercises.push(exerciseDTO);
  }

  return response;
}

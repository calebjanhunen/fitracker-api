export class ExercisesForWorkoutResponseDTO {
  exercises: ExerciseForWorkout[];
}

class ExerciseForWorkout {
  id: string;
  name: string;
  primaryMuscle: string;
}

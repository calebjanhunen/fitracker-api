import { Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exercise } from './exercise.entity';
import { Set } from './set.entity';
import { Workout } from './workout.entity';

@Entity('workout_exercises')
export class WorkoutExercises {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Workout, (workout) => workout.workoutExercises)
  workout: Workout;

  @ManyToOne(() => Exercise, (exercise) => exercise.workoutExercises)
  exercise: Exercise;

  @OneToMany(() => Set, (set) => set.workoutExercises)
  set: Set;
}

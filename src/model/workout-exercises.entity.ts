import { Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exercise } from './exercise.entity';
import { Set } from './set.entity';
import { Workout } from './workout.entity';

@Entity('workout_exercise')
export class WorkoutExercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Workout, (workout) => workout.workoutExercise, {
    onDelete: 'CASCADE',
  })
  workout: Workout;

  @ManyToOne(() => Exercise, (exercise) => exercise.workoutExercise, {
    onDelete: 'CASCADE',
  })
  exercise: Exercise;

  @OneToMany(() => Set, (set) => set.workoutExercise)
  sets: Set[];
}

import { Exercise } from 'src/modules/exercises/models/exercise.entity';
import { Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Set } from './set.entity';
import { Workout } from './workout.entity';

@Entity('workout_exercise')
export class WorkoutExercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Workout, (workout) => workout.workoutExercises, {
    onDelete: 'CASCADE',
  })
  workout: Workout;

  @ManyToOne(() => Exercise, {
    onDelete: 'CASCADE',
  })
  exercise: Exercise;

  @OneToMany(() => Set, (set) => set.workoutExercise, {
    cascade: ['insert', 'remove'],
  })
  sets: Set[];
}

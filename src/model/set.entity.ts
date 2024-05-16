import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { WorkoutExercises } from './workout-exercises.entity';

@Entity('sets')
export class Set extends BaseEntity {
  @Column({
    type: 'integer',
  })
  weight: number;

  @Column({
    type: 'integer',
  })
  reps: number;

  @Column({
    type: 'integer',
  })
  rpe: number;

  // @ManyToOne(() => Exercise, (exercise) => exercise.sets, {
  //   nullable: false,
  //   onDelete: 'CASCADE',
  // })
  // exercise: Exercise;

  @ManyToOne(() => WorkoutExercises, (workoutExercises) => workoutExercises.set)
  workoutExercises: WorkoutExercises;
}

import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { WorkoutExercise } from './workout-exercises.entity';

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

  @ManyToOne(() => WorkoutExercise, (workoutExercise) => workoutExercise.sets, {
    onDelete: 'CASCADE',
  })
  workoutExercise: WorkoutExercise;
}

import { IExercise, ISet, IWorkout } from 'src/interfaces';
import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Exercise } from './exercise.entity';
import { Workout } from './workout.entity';

@Entity('sets')
export class Set extends BaseEntity implements ISet {
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

  @ManyToOne(() => Workout)
  workout: IWorkout;

  @ManyToOne(() => Exercise)
  exercise: IExercise;
}

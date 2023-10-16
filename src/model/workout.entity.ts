import { IExercise, IUser, IWorkout } from 'src/interfaces';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Exercise } from './exercise.entity';
import { User } from './user.entity';

@Entity('workouts')
export class Workout extends BaseEntity implements IWorkout {
  @Column({
    type: 'varchar',
    length: 255,
  })
  name: string;

  @ManyToOne(() => User)
  user: IUser;

  @ManyToMany(() => Exercise, { onDelete: 'SET NULL' })
  @JoinTable({
    name: 'workout_exercises',
    joinColumn: {
      name: 'workout_id',
    },
    inverseJoinColumn: {
      name: 'exercise_id',
    },
  })
  exercises: IExercise[];
}

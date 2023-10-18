import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Exercise } from './exercise.entity';
import { Set } from './set.entity';
import { User } from './user.entity';

@Entity('workouts')
export class Workout extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 255,
  })
  name: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @ManyToMany(() => Exercise, { onDelete: 'CASCADE' })
  @JoinTable({
    name: 'workout_exercises',
    joinColumn: {
      name: 'workout_id',
    },
    inverseJoinColumn: {
      name: 'exercise_id',
    },
  })
  exercises: Exercise[];

  @OneToMany(() => Set, (set) => set.workout)
  sets: Set[];
}

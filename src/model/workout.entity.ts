import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { WorkoutExercises } from './workout-exercises.entity';

@Entity('workouts')
export class Workout extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 255,
  })
  name: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @OneToMany(
    () => WorkoutExercises,
    (workoutExercises) => workoutExercises.workout,
  )
  workoutExercises: WorkoutExercises;
}

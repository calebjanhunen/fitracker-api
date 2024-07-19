import { BaseEntity } from 'src/common/models';
import { User } from 'src/modules/user/models/user.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { WorkoutExercise } from './workout-exercises.entity';

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
    () => WorkoutExercise,
    (workoutExercise) => workoutExercise.workout,
    { cascade: ['insert', 'remove'] },
  )
  workoutExercises: WorkoutExercise[];
}

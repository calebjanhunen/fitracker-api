import { BaseEntity } from 'src/common/models';
import { User } from 'src/modules/user/models/user.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { WorkoutTemplateExercise } from './workout-template-exercise.entity';

@Entity('workout_templates')
export class WorkoutTemplate extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @OneToMany(
    () => WorkoutTemplateExercise,
    (WorkoutTemplateExercise) => WorkoutTemplateExercise.workoutTemplate,
    { cascade: ['insert', 'remove'] },
  )
  workoutTemplateExercises: WorkoutTemplateExercise[];
}

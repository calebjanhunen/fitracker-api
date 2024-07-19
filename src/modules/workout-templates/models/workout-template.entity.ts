import { BaseEntity } from 'src/common/models';
import { Column, Entity, OneToMany } from 'typeorm';
import { WorkoutTemplateExercise } from './workout-template-exercise.entity';

@Entity('workout_templates')
export class WorkoutTemplate extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 255,
  })
  name: string;

  @OneToMany(
    () => WorkoutTemplateExercise,
    (WorkoutTemplateExercise) => WorkoutTemplateExercise.workout,
  )
  workoutTemplateExercises: WorkoutTemplateExercise[];
}

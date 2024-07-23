import { Exercise } from 'src/modules/exercises/models/exercise.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WorkoutTemplateSet } from './workout-template-set.entity';
import { WorkoutTemplate } from './workout-template.entity';

@Entity('workout_template_exercise')
export class WorkoutTemplateExercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'integer',
  })
  order: number;

  @ManyToOne(
    () => WorkoutTemplate,
    (workoutTemplate) => workoutTemplate.workoutTemplateExercises,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  workoutTemplate: WorkoutTemplate;

  @ManyToOne(() => Exercise, (exercise) => exercise.workoutExercise, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  exercise: Exercise;

  @OneToMany(() => WorkoutTemplateSet, (set) => set.workoutTemplateExercise, {
    cascade: ['insert'],
  })
  sets: WorkoutTemplateSet[];
}

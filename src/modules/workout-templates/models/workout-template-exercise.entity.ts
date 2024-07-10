import { Exercise } from 'src/model';
import { Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { WorkoutTemplateSet } from './workout-template-set.entity';
import { WorkoutTemplate } from './workout-template.entity';

@Entity('workout_template_exercise')
export class WorkoutTemplateExercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => WorkoutTemplate,
    (workoutTemplate) => workoutTemplate.workoutTemplateExercises,
    {
      onDelete: 'CASCADE',
    },
  )
  workout: WorkoutTemplate;

  @ManyToOne(() => Exercise, (exercise) => exercise.workoutExercise, {
    onDelete: 'CASCADE',
  })
  exercise: Exercise;

  @OneToMany(() => WorkoutTemplateSet, (set) => set.workoutTemplateExercise)
  sets: WorkoutTemplateSet[];
}

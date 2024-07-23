import { SetType } from 'src/common/enums/set-type.enum';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { WorkoutTemplateExercise } from './workout-template-exercise.entity';

@Entity('workout_template_sets')
export class WorkoutTemplateSet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: SetType,
    nullable: false,
  })
  type: SetType;

  @Column({
    type: 'integer',
    nullable: false,
  })
  order: number;

  @ManyToOne(
    () => WorkoutTemplateExercise,
    (workoutTemplateExercise) => workoutTemplateExercise.sets,
    { onDelete: 'CASCADE', nullable: false },
  )
  workoutTemplateExercise: WorkoutTemplateExercise;
}

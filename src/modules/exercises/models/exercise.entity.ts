import { BaseEntity } from 'src/common/models';
import { ExerciseDifficultyLevel } from 'src/modules/exercises/enums/exercise-difficulty-level';
import { User } from 'src/modules/user/models/user.entity';
import { WorkoutTemplateExercise } from 'src/modules/workout-templates/models/workout-template-exercise.entity';
import { WorkoutExercise } from 'src/modules/workouts/models/workout-exercises.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity('exercises')
export class Exercise extends BaseEntity {
  @Column({
    type: 'varchar',
    length: '255',
  })
  name: string;

  @Column({
    type: 'enum',
    enum: ExerciseDifficultyLevel,
  })
  difficultyLevel: ExerciseDifficultyLevel;

  @Column({
    type: 'varchar',
    length: '255',
  })
  equipment: string;

  @Column({
    type: 'text',
    array: true,
  })
  instructions: string[];

  @Column({
    type: 'varchar',
    length: '255',
  })
  primaryMuscle: string;

  @Column({
    type: 'varchar',
    length: '255',
    nullable: true,
    array: true,
  })
  secondaryMuscles: string[];

  @Column({
    type: 'boolean',
    default: false,
  })
  isCustom: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn()
  user: User | null;

  @OneToMany(
    () => WorkoutExercise,
    (workoutExercise) => workoutExercise.exercise,
  )
  workoutExercise: WorkoutExercise[];

  @OneToMany(
    () => WorkoutTemplateExercise,
    (workoutTemplateExercise) => workoutTemplateExercise.exercise,
  )
  workoutTemplateExercise: WorkoutTemplateExercise[];
}

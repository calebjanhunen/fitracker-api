import { ExerciseDifficultyLevel } from 'src/api/utils/enums/exercise-difficulty-level';
import { IExercise } from 'src/interfaces';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('exercises')
export class Exercise extends BaseEntity implements IExercise {
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

  @OneToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn()
  user: User | null;
}

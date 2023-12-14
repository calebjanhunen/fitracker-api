import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Exercise } from './exercise.entity';

@Entity('sets')
export class Set extends BaseEntity {
  @Column({
    type: 'integer',
  })
  weight: number;

  @Column({
    type: 'integer',
  })
  reps: number;

  @Column({
    type: 'integer',
  })
  rpe: number;

  @ManyToOne(() => Exercise, (exercise) => exercise.sets, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  exercise: Exercise;
}

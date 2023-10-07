import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('workout_times')
export default class WorkoutTime {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: '255',
  })
  name: string;
}

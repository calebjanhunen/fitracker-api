import { IUser } from 'src/interfaces';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SkillLevel } from '../api/utils/enums/skill-level';

@Entity('users')
export class User implements IUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    type: 'varchar',
    length: '255',
    unique: true,
  })
  username: string;

  @Column({
    type: 'varchar',
    length: '255',
  })
  password: string;

  @Column({
    type: 'varchar',
    length: '255',
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: '255',
  })
  firstName: string;

  @Column({
    type: 'varchar',
    length: '255',
  })
  lastName: string;

  @Column({
    type: 'enum',
    enum: SkillLevel,
  })
  skillLevel: SkillLevel;
}

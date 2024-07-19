import { SkillLevel } from 'src/modules/auth/enums/skill-level';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
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

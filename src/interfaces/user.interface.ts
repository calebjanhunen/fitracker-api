import { SkillLevel } from 'src/api/utils/enums/skill-level';

export interface IUser {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  skillLevel: SkillLevel;
}

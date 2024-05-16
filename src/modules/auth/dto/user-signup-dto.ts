import { SkillLevel } from 'src/modules/utils/enums/skill-level';

export default class UserSignupDto {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  skillLevel: SkillLevel;
}

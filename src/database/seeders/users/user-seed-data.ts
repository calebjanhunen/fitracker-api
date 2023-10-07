import UserSignupDto from '../../../api/auth/dto/user-signup-dto';
import { SkillLevel } from '../../../utils/enums/skill-level';

export const userSeedData: UserSignupDto[] = [
  {
    username: 'caleb_test',
    password: '123',
    firstName: 'Caleb',
    lastName: 'Test',
    email: 'caleb@example.com',
    skillLevel: SkillLevel.intermediate,
  },
];

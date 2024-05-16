import UserSignupDto from '../../../modules/auth/dto/user-signup-dto';
import { SkillLevel } from '../../../modules/utils/enums/skill-level';

export const userSeedData: UserSignupDto[] = [
  {
    username: 'caleb_test',
    password: '123',
    firstName: 'Caleb',
    lastName: 'Test',
    email: 'caleb@example.com',
    skillLevel: SkillLevel.intermediate,
  },
  {
    username: 'test_user',
    password: '123',
    firstName: 'Test',
    lastName: 'User',
    email: 'testuser@example.com',
    skillLevel: SkillLevel.beginner,
  },
];

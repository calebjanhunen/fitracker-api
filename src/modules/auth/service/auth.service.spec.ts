import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from 'src/model/user.entity';
import * as passwordHelper from 'src/modules/auth/helpers/password-helper';
import { UserService } from 'src/modules/user/service/user.service';
import { SkillLevel } from 'src/modules/utils/enums/skill-level';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtServiceMock: JwtService;

  const testUser: User = {
    id: 'test-uuid',
    username: 'testuser',
    createdAt: new Date(),
    updatedAt: new Date(),
    firstName: 'Test',
    lastName: 'User',
    password: '123',
    email: 'test@example.com',
    skillLevel: SkillLevel.advanced,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        {
          provide: UserService,
          useValue: {
            getByUsername: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtServiceMock = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(userService).toBeDefined();
    expect(jwtServiceMock).toBeDefined();
  });

  describe('Test signIn()', () => {
    const username = 'testuser';
    const password = '1234';

    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(userService, 'getByUsername').mockResolvedValueOnce(null);

      const signin = async () => {
        await authService.signIn(username, password);
      };

      expect(signin).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if passwords do not match', async () => {
      jest.spyOn(userService, 'getByUsername').mockResolvedValueOnce(testUser);

      const signin = async () => {
        await authService.signIn(username, password);
      };

      expect(signin).rejects.toThrow(UnauthorizedException);
    });

    it('should return jwt access token if successfully logged in', async () => {
      jest.spyOn(userService, 'getByUsername').mockResolvedValueOnce(testUser);
      jest
        .spyOn(passwordHelper, 'comparePasswords')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(jwtServiceMock, 'signAsync')
        .mockResolvedValue('test-access-token');

      const result = await authService.signIn(username, '123');

      expect(result).toBe('test-access-token');
    });
  });
});

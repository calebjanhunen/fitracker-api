import {
  HttpException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from 'src/modules/user/service/user.service';
import { UserLoginDto } from '../dto/user-signin.dto';
import { AuthService } from '../service/auth.service';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
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

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('authController should be defined', () => {
    expect(authController).toBeDefined();
  });
  it('authService should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('test login()', () => {
    const userLoginBody: UserLoginDto = {
      username: 'test_user',
      password: '123',
    };

    it('should return access token if login is successful', async () => {
      jest
        .spyOn(authService, 'signIn')
        .mockResolvedValueOnce('test-access-token');

      const result = await authController.login(userLoginBody);

      expect(result).toStrictEqual({ accessToken: 'test-access-token' });
    });
    it('should throw HttpException if username is not found', () => {
      jest
        .spyOn(authService, 'signIn')
        .mockRejectedValueOnce(new NotFoundException());

      const callLogin = async () => {
        await authController.login(userLoginBody);
      };

      expect(callLogin).rejects.toThrow(HttpException);
    });
    it('should throw HttpException if username is found but password is incorrect', () => {
      jest
        .spyOn(authService, 'signIn')
        .mockRejectedValueOnce(new UnauthorizedException());

      const callLogin = async () => {
        await authController.login(userLoginBody);
      };

      expect(callLogin).rejects.toThrow(HttpException);
    });
  });
});

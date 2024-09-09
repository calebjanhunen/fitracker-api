import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import {
  comparePasswords,
  generateHashPassword,
} from 'src/modules/auth/helpers/password-helper';
import { InsertUserModel } from 'src/modules/user/models/insert-user.model';
import { UserService } from '../../user/service/user.service';
import { PasswordsDoNotMatchException } from '../internal-exceptions/passwords-do-not-match.exception';
import { UserWithEmailAlreadyExistsException } from '../internal-exceptions/user-with-email-already-exists.exception';
import { UserWithUsernameAlreadyExistsException } from '../internal-exceptions/user-with-username-already-exists.exception';

@Injectable()
export class AuthService {
  private userService;
  private jwtService;

  constructor(userService: UserService, jwtService: JwtService) {
    this.userService = userService;
    this.jwtService = jwtService;
  }

  async signIn(username: string, password: string): Promise<string> {
    try {
      const user = await this.userService.findByUsername(username);
      if (!user) {
        throw new ResourceNotFoundException(
          `User not found with username: ${username}`,
        );
      }

      const doPasswordsMatch = await comparePasswords(password, user.password);

      if (!doPasswordsMatch) {
        throw new Error();
      }

      const accessToken = await this.generateAcccessToken(user.id);

      return accessToken;
    } catch (error) {
      throw error;
    }
  }

  public async signup(
    userModel: InsertUserModel,
    confirmPassword: string,
  ): Promise<string> {
    if (await this.userService.findByUsername(userModel.username)) {
      throw new UserWithUsernameAlreadyExistsException(userModel.username);
    }
    if (await this.userService.findByEmail(userModel.email)) {
      throw new UserWithEmailAlreadyExistsException(userModel.email);
    }

    if (userModel.password !== confirmPassword) {
      throw new PasswordsDoNotMatchException();
    }

    const hashedPassword = await generateHashPassword(userModel.password);
    userModel.password = hashedPassword;

    const createdUser = await this.userService.create(userModel);

    const accessToken = await this.generateAcccessToken(createdUser.id);
    return accessToken;
  }

  private async generateAcccessToken(userId: string): Promise<string> {
    return await this.jwtService.signAsync({
      id: userId,
    });
  }
}

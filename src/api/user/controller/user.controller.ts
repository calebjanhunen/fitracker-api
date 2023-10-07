import { Controller } from '@nestjs/common';
import { UserService } from '../service/user.service';

@Controller('users')
export class UserController {
  private userService;

  constructor(userService: UserService) {
    this.userService = userService;
  }
}

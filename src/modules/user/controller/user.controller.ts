import {
  ConflictException,
  Controller,
  Get,
  Headers,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { UserResponseDto } from '../dtos/user-response.dto';
import { UserService } from '../service/user.service';

@Controller('/api/user')
@UseGuards(AuthGuard)
export class UserController {
  private userService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  @Get('')
  public async getUserById(
    @Headers('user-id') userId: string,
  ): Promise<UserResponseDto> {
    try {
      const user = await this.userService.findById(userId);
      return plainToInstance(UserResponseDto, user);
    } catch (e) {
      if (e instanceof ResourceNotFoundException) {
        throw new NotFoundException(e.message);
      }
      throw new ConflictException(e.message);
    }
  }
}

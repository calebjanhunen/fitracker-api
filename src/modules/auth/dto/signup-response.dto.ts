import { UserResponseDto } from 'src/modules/user/dtos/user-response.dto';

export class SignupResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
}

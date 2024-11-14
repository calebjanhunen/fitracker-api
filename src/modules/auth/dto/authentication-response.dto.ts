import { UserResponseDto } from 'src/modules/user/dtos/user-response.dto';

export class AuthenticationResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
}

import { ApiProperty } from '@nestjs/swagger';

export class AuthenticationResponseDto {
  @ApiProperty()
  accessToken: string;
  @ApiProperty()
  refreshToken: string;
  @ApiProperty()
  username: string;
}

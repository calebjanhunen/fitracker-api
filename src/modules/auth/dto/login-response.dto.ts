export class LoginResponseDto {
  user: {
    username: string;
    firstName: string;
    lastName: string;
  };
  accessToken: string;
}

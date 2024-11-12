import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ConfirmSignupCodeDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsEmail()
  @IsNotEmpty()
  @IsString()
  email: string;
}

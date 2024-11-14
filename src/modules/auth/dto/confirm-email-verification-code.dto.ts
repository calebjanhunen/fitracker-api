import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ConfirmEmailVerificationCodeDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsEmail()
  @IsNotEmpty()
  @IsString()
  email: string;
}

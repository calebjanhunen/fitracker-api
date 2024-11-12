import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendSignupCodeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

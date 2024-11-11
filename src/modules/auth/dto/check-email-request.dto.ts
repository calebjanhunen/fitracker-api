import { IsEmail } from 'class-validator';

export class CheckEmailRequestDto {
  @IsEmail()
  email: string;
}

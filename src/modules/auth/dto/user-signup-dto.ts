import { AutoMap } from '@automapper/classes';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export default class UserSignupDto {
  @IsNotEmpty()
  @IsString()
  @AutoMap()
  username: string;

  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minNumbers: 1,
    minUppercase: 1,
    minLowercase: 1,
    minSymbols: 1,
  })
  @AutoMap()
  password: string;

  @IsNotEmpty()
  @IsString()
  confirmPassword: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @AutoMap()
  email: string;

  @IsNotEmpty()
  @IsString()
  @AutoMap()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @AutoMap()
  lastName: string;
}

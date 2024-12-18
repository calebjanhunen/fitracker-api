import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty()
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
  @ApiProperty()
  password: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  confirmPassword: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @AutoMap()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @AutoMap()
  @ApiProperty()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @AutoMap()
  @ApiProperty()
  lastName: string;
}

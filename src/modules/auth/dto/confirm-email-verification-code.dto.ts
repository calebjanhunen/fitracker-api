import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ConfirmEmailVerificationCodeDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  code: string;

  @IsEmail()
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  email: string;
}

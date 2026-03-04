import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  otp: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  newPassword: string;
}

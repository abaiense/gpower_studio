import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterStudioDto {
  @IsString()
  @MinLength(2)
  studioName!: string;

  @IsString()
  @MinLength(2)
  firstName!: string;

  @IsString()
  @MinLength(2)
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

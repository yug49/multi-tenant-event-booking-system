import { IsString, IsNotEmpty, IsEmail, MaxLength, MinLength, IsUUID } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsUUID()
  @IsNotEmpty()
  organizationId: string;
}

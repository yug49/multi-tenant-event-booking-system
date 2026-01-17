import { IsUUID, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateExternalRegistrationDto {
  @IsUUID()
  @IsNotEmpty()
  eventId: string;

  @IsEmail()
  @IsNotEmpty()
  externalEmail: string;
}

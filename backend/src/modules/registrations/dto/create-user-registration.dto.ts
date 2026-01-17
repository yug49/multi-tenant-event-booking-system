import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateUserRegistrationDto {
  @IsUUID()
  @IsNotEmpty()
  eventId: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;
}

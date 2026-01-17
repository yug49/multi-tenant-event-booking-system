import { IsUUID, IsNotEmpty, IsInt, IsOptional, Min } from 'class-validator';

export class CreateAllocationDto {
  @IsUUID()
  @IsNotEmpty()
  eventId: string;

  @IsUUID()
  @IsNotEmpty()
  resourceId: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  quantityUsed?: number;
}

import {
  IsString,
  MaxLength,
  IsOptional,
  IsUUID,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  capacity?: number;

  @IsUUID()
  @IsOptional()
  parentEventId?: string | null;
}

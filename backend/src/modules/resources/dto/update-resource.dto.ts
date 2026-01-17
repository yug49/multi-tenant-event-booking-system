import {
  IsString,
  MaxLength,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';

export class UpdateResourceDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  maxConcurrentUsage?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  availableQuantity?: number;
}

import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsEnum,
  IsUUID,
  IsBoolean,
  IsInt,
  Min,
  ValidateIf,
} from 'class-validator';
import { ResourceType } from '../../../common/enums';

export class CreateResourceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsEnum(ResourceType)
  @IsNotEmpty()
  type: ResourceType;

  @IsUUID()
  @IsOptional()
  organizationId?: string;

  @IsBoolean()
  @IsOptional()
  isGlobal?: boolean;

  @ValidateIf((o) => o.type === ResourceType.SHAREABLE)
  @IsInt()
  @Min(1)
  maxConcurrentUsage?: number;

  @ValidateIf((o) => o.type === ResourceType.CONSUMABLE)
  @IsInt()
  @Min(0)
  availableQuantity?: number;
}

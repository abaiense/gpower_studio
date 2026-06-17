import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  Min,
  MinLength,
} from 'class-validator';
import { ServiceCategory } from '@gpower/db';

export class CreateServiceDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ServiceCategory)
  category!: ServiceCategory;

  @IsNumber()
  @Min(1)
  durationMin!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  basePrice?: number;
}

export class UpdateServiceDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ServiceCategory)
  @IsOptional()
  category?: ServiceCategory;

  @IsNumber()
  @Min(1)
  @IsOptional()
  durationMin?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  basePrice?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

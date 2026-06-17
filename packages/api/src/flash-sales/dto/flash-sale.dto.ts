import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  IsEnum,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { FlashSlotStatus } from '@gpower/db';

export class CreateFlashSlotDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0.01)
  originalPrice!: number;

  @IsNumber()
  @Min(0.01)
  discountPrice!: number;

  @IsDateString()
  sessionAt!: string;

  @IsDateString()
  claimDeadline!: string;

  @IsString()
  @IsNotEmpty()
  artistId!: string;

  @IsString()
  @IsNotEmpty()
  serviceId!: string;
}

export class QueryFlashSlotDto {
  @IsOptional()
  @IsEnum(FlashSlotStatus)
  status?: FlashSlotStatus;
}

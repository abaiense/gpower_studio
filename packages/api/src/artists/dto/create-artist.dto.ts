import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsNumber,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CommissionType } from '@gpower/db';

class CreateScheduleDto {
  @IsNumber()
  @Min(0)
  dayOfWeek!: number;

  @IsString()
  startTime!: string;

  @IsString()
  endTime!: string;
}

export class CreateArtistDto {
  @IsString()
  @MinLength(2)
  firstName!: string;

  @IsString()
  @MinLength(2)
  lastName!: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  photoUrl?: string;

  @IsString()
  @IsOptional()
  instagram?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  styles?: string[];

  @IsEnum(CommissionType)
  @IsOptional()
  commissionType?: CommissionType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  commissionValue?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateScheduleDto)
  @IsOptional()
  schedules?: CreateScheduleDto[];
}

export class UpdateArtistDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  firstName?: string;

  @IsString()
  @MinLength(2)
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  photoUrl?: string;

  @IsString()
  @IsOptional()
  instagram?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  styles?: string[];

  @IsEnum(CommissionType)
  @IsOptional()
  commissionType?: CommissionType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  commissionValue?: number;

  @IsOptional()
  isActive?: boolean;
}

export class UpsertScheduleDto {
  @IsNumber()
  @Min(0)
  dayOfWeek!: number;

  @IsString()
  startTime!: string;

  @IsString()
  endTime!: string;

  @IsOptional()
  isActive?: boolean;
}

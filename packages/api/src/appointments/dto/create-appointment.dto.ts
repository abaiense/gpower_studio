import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  Min,
  MinLength,
} from 'class-validator';
import { AppointmentStatus } from '@gpower/db';

export class CreateAppointmentDto {
  @IsDateString()
  startAt!: string;

  @IsDateString()
  endAt!: string;

  @IsString()
  @MinLength(1)
  clientId!: string;

  @IsString()
  @MinLength(1)
  artistId!: string;

  @IsString()
  @MinLength(1)
  serviceId!: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  depositAmount?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  sessionNumber?: number;

  @IsString()
  @IsOptional()
  projectId?: string;
}

export class UpdateAppointmentDto {
  @IsDateString()
  @IsOptional()
  startAt?: string;

  @IsDateString()
  @IsOptional()
  endAt?: string;

  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  depositAmount?: number;

  @IsString()
  @IsOptional()
  serviceId?: string;

  @IsString()
  @IsOptional()
  artistId?: string;

  @IsString()
  @IsOptional()
  projectId?: string;
}

export class QueryAppointmentDto {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @IsString()
  @IsOptional()
  artistId?: string;
}

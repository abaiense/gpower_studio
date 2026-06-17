import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsNotEmpty,
  Min,
  MinLength,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AppointmentStatus, PaymentMethod } from '@gpower/db';

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

export class GetAvailabilityDto {
  @IsString()
  @IsNotEmpty()
  artistId!: string;

  @IsDateString()
  date!: string;
}

export class PaymentItemDto {
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @IsNumber()
  @Min(0.01)
  amount!: number;
}

export class CloseSessionDto {
  @IsNumber()
  @Min(0)
  totalPrice!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentItemDto)
  payments!: PaymentItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CashReportQueryDto {
  @IsDateString()
  date!: string;
}

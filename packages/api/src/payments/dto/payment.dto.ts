import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  MaxLength,
  Min,
  Max,
  IsInt,
} from 'class-validator';
import { PaymentMethod } from '@gpower/db';

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  appointmentId!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @IsOptional()
  @IsString()
  externalId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  gateway?: string;
}

export class CreateManualPaymentDto {
  @IsString()
  @IsNotEmpty()
  appointmentId!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  installments?: number;
}

export class CreateCheckoutDto {
  @IsString()
  @IsNotEmpty()
  appointmentId!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  maxInstallments?: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class MpWebhookDto {
  @IsString()
  type!: string;

  data!: { id: string };
}

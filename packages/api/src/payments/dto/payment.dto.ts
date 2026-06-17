import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  MaxLength,
  Min,
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

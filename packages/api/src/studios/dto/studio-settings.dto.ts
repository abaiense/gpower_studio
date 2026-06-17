import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export enum DepositType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export class StudioSettingsDto {
  @IsOptional()
  @IsBoolean()
  depositEnabled?: boolean;

  @IsOptional()
  @IsEnum(DepositType)
  depositType?: DepositType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  depositValue?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(168)
  depositExpiryHours?: number;

  @IsOptional()
  @IsBoolean()
  whatsappEnabled?: boolean;

  @IsOptional()
  @IsString()
  whatsappPhoneNumberId?: string;

  @IsOptional()
  @IsString()
  whatsappAccessToken?: string;

  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @IsOptional()
  @IsString()
  emailFromName?: string;

  @IsOptional()
  @IsEmail()
  emailFromAddress?: string;
}

export class UpdatePaymentConfigDto {
  @IsOptional()
  @IsString()
  mpAccessToken?: string;

  @IsOptional()
  @IsString()
  mpPublicKey?: string;
}

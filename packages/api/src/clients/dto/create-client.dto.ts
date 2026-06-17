import {
  IsString,
  IsOptional,
  IsEmail,
  IsBoolean,
  IsNotEmpty,
  MaxLength,
  Matches,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateClientDto {
  @IsString()
  @MinLength(2)
  firstName!: string;

  @IsString()
  @MinLength(2)
  lastName!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  phone!: string;

  @IsString()
  @IsOptional()
  birthDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  allergies?: string;
}

export class SearchClientDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }: { value: unknown }) => value === 'true' || value === true)
  isBlocked?: boolean;
}

export class GeneratePhotoUploadUrlDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  fileName!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^image\//)
  contentType!: string;
}

export class UpdateClientDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  firstName?: string;

  @IsString()
  @MinLength(2)
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  birthDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  allergies?: string;

  @IsBoolean()
  @IsOptional()
  isBlocked?: boolean;

  @IsString()
  @IsOptional()
  blockReason?: string;
}

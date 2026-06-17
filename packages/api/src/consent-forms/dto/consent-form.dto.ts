import { IsString, IsOptional } from 'class-validator';

export class CreateConsentFormDto {
  @IsString() formType: string; // 'TATTOO_ADULT' | 'PIERCING_ADULT' | 'MINOR' | 'TOUCH_UP'
  @IsString() clientId: string;
  @IsOptional() @IsString() appointmentId?: string;
  @IsOptional() @IsString() projectId?: string;
}

export class QueryConsentFormDto {
  @IsOptional() @IsString() clientId?: string;
  @IsOptional() @IsString() status?: string; // 'PENDING' | 'SIGNED'
}

import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class InitUploadDto {
  @IsString() filename: string;
  @IsString() mimeType: string;
  @IsInt() @Min(1) sizeBytes: number;
  @IsOptional() @IsString() notes?: string;
}

export class ConfirmUploadDto {
  @IsString() s3Key: string;
}

export class SendForApprovalDto {
  @IsOptional() @IsString() notes?: string;
}

export class RequestRevisionDto {
  @IsString() clientNotes: string;
}

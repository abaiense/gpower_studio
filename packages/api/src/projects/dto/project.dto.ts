import { IsString, IsOptional, IsInt, IsEnum, Min } from 'class-validator';
import { ProjectStatus } from '@gpower/db';

export class CreateProjectDto {
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
  @IsString() clientId: string;
  @IsString() artistId: string;
  @IsOptional() @IsInt() @Min(1) estimatedSessions?: number;
}

export class UpdateProjectDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsInt() @Min(1) estimatedSessions?: number;
  @IsOptional() @IsEnum(ProjectStatus) status?: ProjectStatus;
}

export class QueryProjectDto {
  @IsOptional() @IsString() artistId?: string;
  @IsOptional() @IsString() clientId?: string;
  @IsOptional() @IsEnum(ProjectStatus) status?: ProjectStatus;
}

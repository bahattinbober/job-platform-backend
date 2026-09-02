import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApplicationStatus } from '../../../generated/prisma/client';

export class CreateApplicationDto {
  @IsString()
  jobId!: string;

  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

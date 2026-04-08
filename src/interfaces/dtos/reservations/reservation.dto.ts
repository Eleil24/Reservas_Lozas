import { IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  fieldId: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsString()
  @IsOptional()
  tenantId?: string;

  @IsString()
  @IsOptional()
  userId?: string;
}

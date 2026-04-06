import { IsString, IsDateString } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  fieldId: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsString()
  tenantId: string;

  @IsString()
  userId: string;
}

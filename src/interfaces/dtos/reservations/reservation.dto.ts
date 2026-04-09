import { IsString, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReservationDto {
  @ApiProperty({ description: 'The ID of the field to reserve', example: 'uuid-1234' })
  @IsString()
  fieldId: string;

  @ApiProperty({ description: 'Start time of the reservation', example: '2023-12-01T10:00:00Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ description: 'End time of the reservation', example: '2023-12-01T11:00:00Z' })
  @IsDateString()
  endTime: string;

  @ApiProperty({ description: 'Optional Tenant ID (Required for Super Admin)', required: false })
  @IsString()
  @IsOptional()
  tenantId?: string;

  @ApiProperty({ description: 'Optional User ID (Admins can specify different users)', required: false })
  @IsString()
  @IsOptional()
  userId?: string;
}

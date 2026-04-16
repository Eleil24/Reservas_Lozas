import { IsString, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReservationDto {
  @ApiProperty({ description: 'ID de la cancha a reservar', example: 'uuid-1234' })
  @IsString()
  fieldId: string;

  @ApiProperty({ description: 'Hora de inicio de la reserva', example: '2024-05-20T10:00:00Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ description: 'Hora de fin de la reserva', example: '2024-05-20T11:00:00Z' })
  @IsDateString()
  endTime: string;

  @ApiProperty({ 
    description: 'ID de la sede (Obligatorio SOLO para Super Admin)', 
    required: false 
  })
  @IsString()
  @IsOptional()
  tenantId?: string;

  @ApiProperty({ 
    description: 'ID del cliente (Opcional para Admins si la reserva no es para ellos)', 
    required: false 
  })
  @IsString()
  @IsOptional()
  userId?: string;
}

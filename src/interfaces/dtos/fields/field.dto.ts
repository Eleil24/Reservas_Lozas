import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFieldDto {
  @ApiProperty({ description: 'The name of the football field', example: 'Cancha 1 - Sintética' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Optional description of the field', required: false, example: 'Fútbol 5, techada' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Tenant ID to which the field belongs (Optional for regular admins)', example: 'tenant-uuid', required: false })
  @IsString()
  tenantId: string;
}

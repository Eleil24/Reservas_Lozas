import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({ description: 'The unique name of the organization/tenant', example: 'Downtown Sports Complex' })
  @IsString()
  @MinLength(3)
  name: string;
}

import { IsString, IsOptional } from 'class-validator';

export class CreateFieldDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  tenantId: string;
}

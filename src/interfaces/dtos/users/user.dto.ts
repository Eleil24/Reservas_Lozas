import { IsString, IsEmail, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../domain/value-objects/role';

export class CreateUserDto {
  @ApiProperty({ description: 'The full name of the user', example: 'Jane Doe' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'The email address of the user', example: 'jane@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'A secure password', example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'The role of the user inside the tenant', enum: Role, example: Role.ADMIN })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ description: 'Optional Tenant ID (Implicit if created by Tenant Admin)', required: false })
  @IsString()
  @IsOptional()
  tenantId?: string;
}

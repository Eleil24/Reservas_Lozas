import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'The full name of the user', example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'The email address of the user', example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'A secure password (minimum 6 characters)', example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'The UUID of the selected tenant/sede', example: 'uuid-1234' })
  @IsString()
  tenantId: string;
}

export class LoginDto {
  @ApiProperty({ description: 'The user email', example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'The user password', example: 'password123' })
  @IsString()
  password: string;

  @ApiProperty({ description: 'Optional Tenant ID (Required if user belongs to multiple tenants)', required: false })
  @IsString()
  @IsOptional()
  tenantId?: string;
}

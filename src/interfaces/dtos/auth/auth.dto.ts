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
  @ApiProperty({
    description: 'Email del usuario. Ejemplo para Super Admin: super@sistema.com',
    example: 'super@sistema.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario. Ejemplo para Super Admin: superadmin123',
    example: 'superadmin123'
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'ID de la sede (Tenant). OBLIGATORIO para Admin y Clientes. OMITIR para el Super Admin.',
    required: false,
    example: '',
    nullable: true
  })
  @IsString()
  @IsOptional()
  tenantId?: string;
}

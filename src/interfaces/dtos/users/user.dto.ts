import { IsString, IsEmail, MinLength, IsEnum, IsOptional } from 'class-validator';
import { Role } from '../../../domain/value-objects/role';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(Role)
  role: Role;

  @IsString()
  @IsOptional()
  tenantId?: string;
}

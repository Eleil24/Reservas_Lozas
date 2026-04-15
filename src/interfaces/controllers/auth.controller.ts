import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterUseCase } from '../../application/use-cases/auth/register.use-case';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { RegisterDto, LoginDto } from '../dtos/auth/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private registerUseCase: RegisterUseCase,
    private loginUseCase: LoginUseCase,
  ) { }

  @ApiOperation({ summary: 'Register a new tenant and an admin user' })
  @ApiResponse({ status: 201, description: 'Tenant and User registered successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request (e.g. email already in use)' })
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.registerUseCase.execute(dto);
  }

  @ApiOperation({ 
    summary: 'Login and get a JWT token',
    description: 'Existen dos flujos: \n\n 1. **Super Admin**: Solo email y password (sin tenantId). \n 2. **Admin/Cliente**: Requiere email, password y el tenantId de su sede.'
  })
  @ApiResponse({ status: 200, description: 'User authenticated, returns JWT token.' })
  @ApiResponse({ status: 401, description: 'Unauthorized (Invalid credentials).' })
  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }
}
